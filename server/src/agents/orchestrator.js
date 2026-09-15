const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const ExecutionLog = require('../models/ExecutionLog');
const { emitExecutionEvent } = require('../config/socket');

// Check LangGraph availability
let langGraphStatus = 'not-installed';
try {
  require.resolve('@langchain/langgraph');
  langGraphStatus = 'available';
} catch {
  langGraphStatus = 'not-installed';
}

/**
 * Orchestrator
 * Central coordinator that runs the 5-agent chain for a workflow execution.
 * Supports pause, resume, and cancellation.
 */
class Orchestrator {
  constructor() {
    this.activeExecutions = new Map(); // executionId -> { paused, cancelled }
  }

  /**
   * Run the full agent chain for an execution.
   * @param {Object} execution - Mongoose Execution document
   * @param {Object} workflowSnapshot - { nodes, edges, name, ... }
   * @param {Object} options - { integrationService }
   * @returns {Object} Final execution result
   */
  async run(execution, workflowSnapshot, options = {}) {
    const execId = execution._id.toString();
    const wfId = execution.workflowId.toString();

    // Register this execution as active
    this.activeExecutions.set(execId, { paused: false, cancelled: false });

    const startTime = Date.now();
    const nodeOutputs = {};
    let finalStatus = 'COMPLETED';
    let finalError = null;

    try {
      // ─── Stage 1: PLANNER ──────────────────────────
      const planResult = await plannerAgent.plan(workflowSnapshot);
      const planEvent = monitoringAgent.plannerEvent(execId, wfId, planResult);
      await this._persistAndEmit(planEvent);

      if (!planResult.isValid) {
        // Still attempt execution with the plan, just log warning
      }

      const { executionPlan } = planResult;

      // Build a node map for quick lookup
      const nodeMap = {};
      (workflowSnapshot.nodes || []).forEach((n) => { nodeMap[n.id] = n; });

      // ─── Stage 2-4: EXECUTE → VALIDATE → RECOVER per node ──
      for (const nodeId of executionPlan) {
        // Check cancellation
        const state = this.activeExecutions.get(execId);
        if (state?.cancelled) {
          finalStatus = 'CANCELLED';
          break;
        }

        // Check pause — wait loop
        while (state?.paused && !state?.cancelled) {
          await this._sleep(500);
          const refreshedState = this.activeExecutions.get(execId);
          if (refreshedState?.cancelled) { finalStatus = 'CANCELLED'; break; }
          if (!refreshedState?.paused) break;
        }
        if (finalStatus === 'CANCELLED') break;

        const node = nodeMap[nodeId];
        if (!node) continue;

        // Update current node on execution
        execution.currentNodeId = nodeId;
        execution.status = 'RUNNING';
        await execution.save();

        // Emit execution start
        const startEvent = monitoringAgent.executionStartEvent(execId, wfId, nodeId, node.data?.label);
        await this._persistAndEmit(startEvent);

        // ── EXECUTION AGENT ──
        const previousOutputs = this._gatherPreviousOutputs(nodeId, workflowSnapshot.edges || [], nodeOutputs);
        const nodeResult = await executionAgent.executeNode(node, {
          inputs: execution.inputs || {},
          previousOutputs,
          integrationService: options.integrationService || null,
        });

        const resultEvent = monitoringAgent.executionResultEvent(execId, wfId, nodeResult);
        await this._persistAndEmit(resultEvent);

        // ── VALIDATION AGENT ──
        const validationResult = await validationAgent.validate(nodeResult, node);
        const validEvent = monitoringAgent.validationEvent(execId, wfId, validationResult);
        await this._persistAndEmit(validEvent);

        // ── RECOVERY AGENT (if needed) ──
        if (!nodeResult.success) {
          const recoveryResult = await recoveryAgent.recover({
            message: nodeResult.error,
            nodeId,
            nodeType: node.type,
            retryCount: execution.retryCount || 0,
          });
          const recoverEvent = monitoringAgent.recoveryEvent(execId, wfId, recoveryResult);
          await this._persistAndEmit(recoverEvent);

          if (recoveryResult.shouldEscalate) {
            finalStatus = 'FAILED';
            finalError = { nodeId, error: nodeResult.error, classification: recoveryResult.classification };
            break;
          } else {
            // Retry with backoff
            execution.status = 'RETRYING';
            execution.retryCount = (execution.retryCount || 0) + 1;
            await execution.save();
            await this._sleep(recoveryResult.backoffMs);
            // Re-execute the same node
            const retryResult = await executionAgent.executeNode(node, {
              inputs: execution.inputs || {},
              previousOutputs,
              integrationService: options.integrationService || null,
            });
            if (!retryResult.success) {
              finalStatus = 'FAILED';
              finalError = { nodeId, error: retryResult.error, retriesExhausted: true };
              break;
            }
            nodeOutputs[nodeId] = retryResult.output;
          }
        } else {
          nodeOutputs[nodeId] = nodeResult.output;
        }

        // For condition nodes, skip branches where condition is not met
        if (node.type === 'condition' && nodeResult.output?.conditionMet === false) {
          // Mark downstream as skipped (simplified — just continue)
        }
      }

      // ─── Stage 5: MONITORING — Final ─────────────────
      const durationMs = Date.now() - startTime;
      const completionEvent = monitoringAgent.completionEvent(execId, wfId, finalStatus, durationMs);
      await this._persistAndEmit(completionEvent);

      // Update execution document
      execution.status = finalStatus;
      execution.outputs = nodeOutputs;
      execution.error = finalError;
      execution.endTime = new Date();
      execution.durationMs = durationMs;
      execution.orchestratorMeta = {
        langGraph: langGraphStatus,
        agentsInvoked: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
        totalNodes: Object.keys(nodeOutputs).length,
      };
      await execution.save();

      // Cleanup active state
      this.activeExecutions.delete(execId);

      return {
        status: finalStatus,
        outputs: nodeOutputs,
        error: finalError,
        durationMs,
        langGraph: langGraphStatus,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      execution.status = 'FAILED';
      execution.error = { message: err.message };
      execution.endTime = new Date();
      execution.durationMs = durationMs;
      execution.orchestratorMeta = { langGraph: langGraphStatus };
      await execution.save();
      this.activeExecutions.delete(execId);

      throw err;
    }
  }

  /**
   * Pause an active execution.
   */
  pause(executionId) {
    const state = this.activeExecutions.get(executionId);
    if (state) {
      state.paused = true;
      return true;
    }
    return false;
  }

  /**
   * Resume a paused execution.
   */
  resume(executionId) {
    const state = this.activeExecutions.get(executionId);
    if (state) {
      state.paused = false;
      return true;
    }
    return false;
  }

  /**
   * Cancel an active execution.
   */
  cancel(executionId) {
    const state = this.activeExecutions.get(executionId);
    if (state) {
      state.cancelled = true;
      state.paused = false; // Unblock if paused
      return true;
    }
    return false;
  }

  /**
   * Gather outputs from parent nodes connected via edges.
   */
  _gatherPreviousOutputs(nodeId, edges, nodeOutputs) {
    const parentEdges = edges.filter((e) => e.target === nodeId);
    const combined = {};
    for (const edge of parentEdges) {
      const parentOutput = nodeOutputs[edge.source];
      if (parentOutput) {
        Object.assign(combined, parentOutput);
      }
    }
    return combined;
  }

  /**
   * Persist a log event and emit via Socket.IO.
   */
  async _persistAndEmit(event) {
    try {
      await ExecutionLog.create(event);
    } catch (err) {
      console.warn('Failed to persist execution log:', err.message);
    }

    emitExecutionEvent(event.executionId, 'execution:event', {
      agent: event.agent,
      level: event.level,
      message: event.message,
      nodeId: event.nodeId,
      metadata: event.metadata,
      timestamp: event.timestamp,
    });
  }

  async _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new Orchestrator();

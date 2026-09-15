/**
 * Monitoring Agent
 * Pure agent: Emits structured timeline events and agent telemetry.
 */
class MonitoringAgent {
  /**
   * Create a timeline log event.
   * @param {Object} params
   * @returns {Object} Structured log entry
   */
  createEvent({ executionId, workflowId, nodeId, agent, level, message, metadata = {} }) {
    return {
      executionId,
      workflowId,
      nodeId: nodeId || null,
      agent: agent || 'monitoring',
      level: level || 'info',
      message,
      metadata: {
        ...metadata,
        emittedAt: new Date().toISOString(),
      },
      timestamp: new Date(),
    };
  }

  /**
   * Create a planner event.
   */
  plannerEvent(executionId, workflowId, planResult) {
    return this.createEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: planResult.isValid ? 'success' : 'warning',
      message: planResult.isValid
        ? `Planner generated execution plan: ${planResult.executionPlan.length} nodes, confidence ${planResult.confidenceScore}`
        : `Planner detected issues: cycle detected or empty graph`,
      metadata: {
        executionPlan: planResult.executionPlan,
        confidenceScore: planResult.confidenceScore,
        totalNodes: planResult.totalNodes,
        totalEdges: planResult.totalEdges,
      },
    });
  }

  /**
   * Create an execution start event for a node.
   */
  executionStartEvent(executionId, workflowId, nodeId, nodeLabel) {
    return this.createEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'execution',
      level: 'info',
      message: `Executing node: ${nodeLabel || nodeId}`,
    });
  }

  /**
   * Create an execution result event for a node.
   */
  executionResultEvent(executionId, workflowId, nodeResult) {
    return this.createEvent({
      executionId,
      workflowId,
      nodeId: nodeResult.nodeId,
      agent: 'execution',
      level: nodeResult.success ? 'success' : 'error',
      message: nodeResult.success
        ? `Node ${nodeResult.nodeId} completed in ${nodeResult.durationMs}ms`
        : `Node ${nodeResult.nodeId} failed: ${nodeResult.error}`,
      metadata: {
        durationMs: nodeResult.durationMs,
        outputKeys: nodeResult.output ? Object.keys(nodeResult.output) : [],
      },
    });
  }

  /**
   * Create a validation event.
   */
  validationEvent(executionId, workflowId, validationResult) {
    return this.createEvent({
      executionId,
      workflowId,
      nodeId: validationResult.nodeId,
      agent: 'validation',
      level: validationResult.isValid ? 'success' : 'warning',
      message: validationResult.isValid
        ? `Validation passed: ${validationResult.validatedFields.length} fields verified`
        : `Validation issues: ${validationResult.issues.map((i) => i.message).join('; ')}`,
      metadata: {
        validatedFields: validationResult.validatedFields,
        issues: validationResult.issues,
      },
    });
  }

  /**
   * Create a recovery event.
   */
  recoveryEvent(executionId, workflowId, recoveryResult) {
    return this.createEvent({
      executionId,
      workflowId,
      nodeId: recoveryResult.nodeId,
      agent: 'recovery',
      level: recoveryResult.shouldEscalate ? 'error' : 'warning',
      message: recoveryResult.shouldEscalate
        ? `Escalated: ${recoveryResult.classification} — ${recoveryResult.originalError}`
        : `Retry scheduled: ${recoveryResult.classification}, backoff ${recoveryResult.backoffMs}ms (attempt ${recoveryResult.currentRetry + 1}/${recoveryResult.maxRetries})`,
      metadata: {
        classification: recoveryResult.classification,
        action: recoveryResult.action,
        backoffMs: recoveryResult.backoffMs,
      },
    });
  }

  /**
   * Create a completion event.
   */
  completionEvent(executionId, workflowId, status, durationMs) {
    return this.createEvent({
      executionId,
      workflowId,
      agent: 'monitoring',
      level: status === 'COMPLETED' ? 'success' : 'error',
      message: `Execution ${status} in ${durationMs}ms`,
      metadata: { finalStatus: status, totalDurationMs: durationMs },
    });
  }
}

module.exports = new MonitoringAgent();

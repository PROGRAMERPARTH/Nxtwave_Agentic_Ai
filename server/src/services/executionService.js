const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const Notification = require('../models/Notification');
const orchestrator = require('../agents/orchestrator');
const { emitUserNotification } = require('../config/socket');

/**
 * Start a new execution for a workflow.
 */
const startExecution = async ({ workflowId, userId, inputs = {} }) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) {
    const error = new Error('Workflow not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  // Create immutable snapshot
  const workflowSnapshot = {
    name: workflow.name,
    description: workflow.description,
    nodes: workflow.nodes,
    edges: workflow.edges,
    version: workflow.version,
    triggerConfig: workflow.triggerConfig,
  };

  const execution = await Execution.create({
    workflowId: workflow._id,
    owner: userId,
    workflowSnapshot,
    status: 'PENDING',
    inputs,
    startTime: new Date(),
  });

  // Run asynchronously — don't await the full orchestration
  setImmediate(async () => {
    try {
      execution.status = 'RUNNING';
      await execution.save();

      const integrationService = require('./integrationService');
      const result = await orchestrator.run(execution, workflowSnapshot, {
        integrationService,
      });

      // Create success notification
      await _createNotification({
        owner: userId,
        workflowId: workflow._id,
        executionId: execution._id,
        type: result.status === 'COMPLETED' ? 'success' : 'failure',
        title: result.status === 'COMPLETED'
          ? `✅ ${workflow.name} completed`
          : `❌ ${workflow.name} failed`,
        message: result.status === 'COMPLETED'
          ? `Execution completed in ${result.durationMs}ms`
          : `Execution failed: ${result.error?.error || 'Unknown error'}`,
      });
    } catch (err) {
      execution.status = 'FAILED';
      execution.error = { message: err.message };
      execution.endTime = new Date();
      await execution.save();

      await _createNotification({
        owner: userId,
        workflowId: workflow._id,
        executionId: execution._id,
        type: 'failure',
        title: `❌ ${workflow.name} failed`,
        message: err.message,
      });
    }
  });

  return execution;
};

/**
 * List executions for a user.
 */
const listExecutions = async ({ userId, status, page = 1, limit = 20 }) => {
  const query = { owner: userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [executions, total] = await Promise.all([
    Execution.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Execution.countDocuments(query),
  ]);

  return {
    executions,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) || 1, limit: Number(limit) },
  };
};

/**
 * Get a single execution with details.
 */
const getExecution = async (id, userId) => {
  const execution = await Execution.findOne({ _id: id, owner: userId });
  if (!execution) {
    const error = new Error('Execution not found.');
    error.statusCode = 404;
    throw error;
  }
  return execution;
};

/**
 * Get timeline logs for an execution.
 */
const getTimeline = async (executionId) => {
  const logs = await ExecutionLog.find({ executionId }).sort({ timestamp: 1 });
  return logs;
};

/**
 * Pause an execution.
 */
const pauseExecution = async (id, userId) => {
  const execution = await Execution.findOne({ _id: id, owner: userId });
  if (!execution) throw Object.assign(new Error('Execution not found.'), { statusCode: 404 });

  if (!['RUNNING', 'RETRYING'].includes(execution.status)) {
    throw Object.assign(new Error(`Cannot pause execution with status ${execution.status}`), { statusCode: 400 });
  }

  orchestrator.pause(id);
  execution.status = 'PAUSED';
  await execution.save();
  return execution;
};

/**
 * Resume a paused execution.
 */
const resumeExecution = async (id, userId) => {
  const execution = await Execution.findOne({ _id: id, owner: userId });
  if (!execution) throw Object.assign(new Error('Execution not found.'), { statusCode: 404 });

  if (execution.status !== 'PAUSED') {
    throw Object.assign(new Error(`Cannot resume execution with status ${execution.status}`), { statusCode: 400 });
  }

  orchestrator.resume(id);
  execution.status = 'RUNNING';
  await execution.save();
  return execution;
};

/**
 * Cancel an execution.
 */
const cancelExecution = async (id, userId) => {
  const execution = await Execution.findOne({ _id: id, owner: userId });
  if (!execution) throw Object.assign(new Error('Execution not found.'), { statusCode: 404 });

  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) {
    throw Object.assign(new Error(`Cannot cancel execution with status ${execution.status}`), { statusCode: 400 });
  }

  orchestrator.cancel(id);
  execution.status = 'CANCELLED';
  execution.endTime = new Date();
  await execution.save();
  return execution;
};

/**
 * Helper: create and emit a notification.
 */
async function _createNotification({ owner, workflowId, executionId, type, title, message }) {
  try {
    const notification = await Notification.create({
      owner,
      workflowId,
      executionId,
      type,
      title,
      message,
    });
    emitUserNotification(owner, notification);
  } catch (err) {
    console.warn('Failed to create notification:', err.message);
  }
}

module.exports = {
  startExecution,
  listExecutions,
  getExecution,
  getTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};

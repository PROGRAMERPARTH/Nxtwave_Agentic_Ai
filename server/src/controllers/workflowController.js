const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');

/**
 * GET /api/workflows/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const stats = await workflowService.getDashboardStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workflows
 */
const list = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const result = await workflowService.listWorkflows({
      userId: req.user.id,
      search,
      status,
      page,
      limit,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workflows/:id
 */
const getById = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.params.id, req.user.id);
    res.json({ success: true, data: { workflow } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflows
 */
const create = async (req, res, next) => {
  try {
    const { name, description, triggerConfig, nodes, edges, tags } = req.body;
    const workflow = await workflowService.createWorkflow({
      name,
      description,
      triggerConfig,
      nodes,
      edges,
      tags,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: { workflow } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/workflows/:id
 */
const update = async (req, res, next) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: { workflow } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflows/:id/duplicate
 */
const duplicate = async (req, res, next) => {
  try {
    const workflow = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: { workflow } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/workflows/:id
 */
const remove = async (req, res, next) => {
  try {
    const result = await workflowService.deleteWorkflow(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflows/generate
 */
const generate = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const generatedGraph = await aiService.generateWorkflowFromPrompt(prompt);
    res.json({ success: true, data: generatedGraph });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflows/:id/execute
 */
const execute = async (req, res, next) => {
  try {
    const executionService = require('../services/executionService');
    const { inputs } = req.body;
    const execution = await executionService.startExecution({
      workflowId: req.params.id,
      userId: req.user.id,
      inputs,
    });
    res.status(202).json({ success: true, data: { execution } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  list,
  getById,
  create,
  update,
  duplicate,
  remove,
  generate,
  execute,
};

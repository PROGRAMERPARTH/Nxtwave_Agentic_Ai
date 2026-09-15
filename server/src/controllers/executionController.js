const executionService = require('../services/executionService');

const list = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await executionService.listExecutions({
      userId: req.user.id,
      status,
      page,
      limit,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const execution = await executionService.getExecution(req.params.id, req.user.id);
    res.json({ success: true, data: { execution } });
  } catch (error) {
    next(error);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const logs = await executionService.getTimeline(req.params.id);
    res.json({ success: true, data: { logs } });
  } catch (error) {
    next(error);
  }
};

const pause = async (req, res, next) => {
  try {
    const execution = await executionService.pauseExecution(req.params.id, req.user.id);
    res.json({ success: true, data: { execution } });
  } catch (error) {
    next(error);
  }
};

const resume = async (req, res, next) => {
  try {
    const execution = await executionService.resumeExecution(req.params.id, req.user.id);
    res.json({ success: true, data: { execution } });
  } catch (error) {
    next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const execution = await executionService.cancelExecution(req.params.id, req.user.id);
    res.json({ success: true, data: { execution } });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, getById, getTimeline, pause, resume, cancel };

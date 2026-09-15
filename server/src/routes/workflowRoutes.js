const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

// Protect all workflow routes
router.use(authMiddleware);

// GET /api/workflows/dashboard
router.get('/dashboard', workflowController.getDashboard);

// POST /api/workflows/generate
router.post(
  '/generate',
  [body('prompt').trim().notEmpty().withMessage('Prompt is required for workflow generation')],
  validateRequest,
  workflowController.generate
);

// GET /api/workflows
router.get('/', workflowController.list);

// POST /api/workflows
router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Workflow name is required')],
  validateRequest,
  workflowController.create
);

// GET /api/workflows/:id
router.get('/:id', workflowController.getById);

// PUT /api/workflows/:id
router.put('/:id', workflowController.update);

// POST /api/workflows/:id/duplicate
router.post('/:id/duplicate', workflowController.duplicate);

// POST /api/workflows/:id/execute
router.post('/:id/execute', workflowController.execute);

// DELETE /api/workflows/:id
router.delete('/:id', workflowController.remove);

module.exports = router;

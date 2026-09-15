const express = require('express');
const integrationController = require('../controllers/integrationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/', integrationController.list);
router.get('/status', integrationController.getStatus);
router.post('/connect', integrationController.connect);
router.post('/:provider/test', integrationController.testConnection);
router.delete('/:provider', integrationController.disconnect);

module.exports = router;

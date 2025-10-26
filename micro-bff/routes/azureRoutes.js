const express = require('express');
const router = express.Router();
const azureController = require('../controllers/azureController');

/**
 * Rotas para integração com Azure Functions e Service Bus
 */

// Azure Functions
router.post('/function1', azureController.processWithFunction1);
router.post('/function2', azureController.notifyWithFunction2);

// Service Bus
router.post('/send-message', azureController.sendMessage);
router.post('/send-batch', azureController.sendBatchMessages);

// Fluxo completo
router.post('/process-and-notify', azureController.processAndNotify);

module.exports = router;

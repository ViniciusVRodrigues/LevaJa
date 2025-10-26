const azureFunctionService = require('../services/azureFunctionService');
const serviceBusService = require('../services/serviceBusService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Controller para integração com serviços Azure
 * Demonstra uso de Azure Functions e Service Bus
 */

class AzureController {
  /**
   * Envia dados para processamento via Azure Function 1
   * POST /api/v1/azure/function1
   */
  async processWithFunction1(req, res, next) {
    try {
      const data = req.body;

      // Chama a Azure Function
      const result = await azureFunctionService.callFunction1(data);

      res.json({
        success: true,
        message: 'Processado via Azure Function 1',
        result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envia notificação via Azure Function 2
   * POST /api/v1/azure/function2
   */
  async notifyWithFunction2(req, res, next) {
    try {
      const data = req.body;

      // Chama a Azure Function
      const result = await azureFunctionService.callFunction2(data);

      res.json({
        success: true,
        message: 'Notificação enviada via Azure Function 2',
        result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envia mensagem para Azure Service Bus
   * POST /api/v1/azure/send-message
   */
  async sendMessage(req, res, next) {
    try {
      const { message } = req.body;

      if (!message) {
        throw new AppError(
          'Mensagem é obrigatória',
          400,
          'BAD_REQUEST',
          ['O campo message é obrigatório']
        );
      }

      // Envia mensagem para o Service Bus
      const result = await serviceBusService.sendMessage(message);

      res.json({
        success: true,
        message: 'Mensagem enviada para Service Bus',
        result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envia múltiplas mensagens para Azure Service Bus
   * POST /api/v1/azure/send-batch
   */
  async sendBatchMessages(req, res, next) {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new AppError(
          'Lista de mensagens inválida',
          400,
          'BAD_REQUEST',
          ['O campo messages deve ser um array não vazio']
        );
      }

      // Envia mensagens em lote para o Service Bus
      const result = await serviceBusService.sendBatchMessages(messages);

      res.json({
        success: true,
        message: `${messages.length} mensagens enviadas para Service Bus`,
        result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exemplo de fluxo completo: 
   * 1. Processa dados com Azure Function
   * 2. Envia resultado para Service Bus
   * POST /api/v1/azure/process-and-notify
   */
  async processAndNotify(req, res, next) {
    try {
      const data = req.body;

      // 1. Processa com Azure Function
      const processResult = await azureFunctionService.callFunction1(data);

      // 2. Envia resultado para Service Bus
      const messageBody = {
        timestamp: new Date().toISOString(),
        action: 'process-and-notify',
        data: processResult
      };

      await serviceBusService.sendMessage(messageBody);

      res.json({
        success: true,
        message: 'Dados processados e notificação enviada',
        processResult
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AzureController();

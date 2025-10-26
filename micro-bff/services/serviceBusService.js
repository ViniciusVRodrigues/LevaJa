const { ServiceBusClient } = require('@azure/service-bus');
const config = require('../config');

/**
 * Serviço para envio de mensagens via Azure Service Bus
 */

class ServiceBusService {
  constructor() {
    this.client = null;
    this.sender = null;
    this.initialized = false;
  }

  /**
   * Inicializa a conexão com o Service Bus
   */
  async initialize() {
    try {
      if (this.initialized) {
        return;
      }

      if (!config.azure?.serviceBus?.connectionString) {
        console.warn('Azure Service Bus connection string not configured');
        return;
      }

      if (!config.azure?.serviceBus?.queueName) {
        console.warn('Azure Service Bus queue name not configured');
        return;
      }

      this.client = new ServiceBusClient(config.azure.serviceBus.connectionString);
      this.sender = this.client.createSender(config.azure.serviceBus.queueName);
      this.initialized = true;
      
      console.log('Azure Service Bus initialized successfully');
    } catch (error) {
      console.error('Error initializing Service Bus:', error.message);
      throw error;
    }
  }

  /**
   * Envia uma mensagem para a fila do Service Bus
   */
  async sendMessage(messageBody) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.sender) {
        console.warn('Service Bus sender not initialized. Skipping message send.');
        return { success: false, message: 'Service Bus not configured' };
      }

      const message = {
        body: messageBody,
        contentType: 'application/json',
      };

      await this.sender.sendMessages(message);
      console.log('Message sent to Service Bus:', messageBody);
      
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error sending message to Service Bus:', error.message);
      throw error;
    }
  }

  /**
   * Envia múltiplas mensagens em lote
   */
  async sendBatchMessages(messages) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.sender) {
        console.warn('Service Bus sender not initialized. Skipping batch send.');
        return { success: false, message: 'Service Bus not configured' };
      }

      const batch = await this.sender.createMessageBatch();
      
      for (const messageBody of messages) {
        const message = {
          body: messageBody,
          contentType: 'application/json',
        };
        
        if (!batch.tryAddMessage(message)) {
          // Se não couber no batch atual, envia e cria um novo
          await this.sender.sendMessages(batch);
          batch.clear();
          batch.tryAddMessage(message);
        }
      }

      if (batch.count > 0) {
        await this.sender.sendMessages(batch);
      }

      console.log(`Batch of ${messages.length} messages sent to Service Bus`);
      
      return { success: true, message: `${messages.length} messages sent successfully` };
    } catch (error) {
      console.error('Error sending batch messages to Service Bus:', error.message);
      throw error;
    }
  }

  /**
   * Fecha a conexão com o Service Bus
   */
  async close() {
    try {
      if (this.sender) {
        await this.sender.close();
      }
      if (this.client) {
        await this.client.close();
      }
      this.initialized = false;
      console.log('Service Bus connection closed');
    } catch (error) {
      console.error('Error closing Service Bus connection:', error.message);
    }
  }
}

module.exports = new ServiceBusService();

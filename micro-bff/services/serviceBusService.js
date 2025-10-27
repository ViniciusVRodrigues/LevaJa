const { ServiceBusClient } = require('@azure/service-bus');
const config = require('../config');

/**
 * Serviço para envio de mensagens via Azure Service Bus
 * Suporta múltiplas filas
 */

class ServiceBusService {
  constructor() {
    this.client = null;
    this.senders = {}; // Map de senders por nome de fila
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

      this.client = new ServiceBusClient(config.azure.serviceBus.connectionString);
      this.initialized = true;
      
      console.log('Azure Service Bus client initialized successfully');
    } catch (error) {
      console.error('Error initializing Service Bus:', error.message);
      throw error;
    }
  }

  /**
   * Obtém ou cria um sender para uma fila específica
   */
  async getSender(queueName) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.client) {
      return null;
    }

    // Usa fila padrão se não especificada
    const targetQueue = queueName || config.azure?.serviceBus?.queueName;

    if (!targetQueue) {
      console.warn('No queue name specified and no default configured');
      return null;
    }

    // Retorna sender existente ou cria novo
    if (!this.senders[targetQueue]) {
      this.senders[targetQueue] = this.client.createSender(targetQueue);
      console.log(`Created Service Bus sender for queue: ${targetQueue}`);
    }

    return this.senders[targetQueue];
  }

  /**
   * Envia uma mensagem para uma fila específica do Service Bus
   */
  async sendMessage(queueName, messageBody) {
    try {
      const sender = await this.getSender(queueName);

      if (!sender) {
        console.warn('Service Bus sender not available. Skipping message send.');
        return { success: false, message: 'Service Bus not configured' };
      }

      const message = {
        body: messageBody,
        contentType: 'application/json',
      };

      await sender.sendMessages(message);
      console.log(`Message sent to Service Bus queue '${queueName}':`, messageBody.eventType || 'Unknown event');
      
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error(`Error sending message to Service Bus queue '${queueName}':`, error.message);
      throw error;
    }
  }

  /**
   * Envia múltiplas mensagens em lote para uma fila específica
   */
  async sendBatchMessages(queueName, messages) {
    try {
      const sender = await this.getSender(queueName);

      if (!sender) {
        console.warn('Service Bus sender not available. Skipping batch send.');
        return { success: false, message: 'Service Bus not configured' };
      }

      const batch = await sender.createMessageBatch();
      
      for (const messageBody of messages) {
        const message = {
          body: messageBody,
          contentType: 'application/json',
        };
        
        if (!batch.tryAddMessage(message)) {
          // Se não couber no batch atual, envia e cria um novo
          await sender.sendMessages(batch);
          batch.clear();
          batch.tryAddMessage(message);
        }
      }

      if (batch.count > 0) {
        await sender.sendMessages(batch);
      }

      console.log(`Batch of ${messages.length} messages sent to Service Bus queue '${queueName}'`);
      
      return { success: true, message: `${messages.length} messages sent successfully` };
    } catch (error) {
      console.error(`Error sending batch messages to Service Bus queue '${queueName}':`, error.message);
      throw error;
    }
  }

  /**
   * Fecha a conexão com o Service Bus
   */
  async close() {
    try {
      // Fecha todos os senders
      for (const [queueName, sender] of Object.entries(this.senders)) {
        await sender.close();
        console.log(`Closed sender for queue: ${queueName}`);
      }
      this.senders = {};

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

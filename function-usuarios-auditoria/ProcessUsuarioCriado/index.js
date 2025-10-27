const { app } = require('@azure/functions');
const { connectDatabase } = require('../config/database');

app.serviceBusQueue('ProcessUsuarioCriado', {
  queueName: 'usuario-criado',
  connection: 'SERVICE_BUS_CONNECTION',
  handler: async (message, context) => {
    try {
      context.log('Processing usuario-criado event:', message);

      // Validar estrutura do evento
      if (!message || !message.eventType || message.eventType !== 'UsuarioCriado') {
        context.error('Invalid event structure:', message);
        return;
      }

      const { timestamp, data } = message;
      const { usuarioId, nome, email } = data;

      // Conectar ao MongoDB
      const db = await connectDatabase();
      const collection = db.collection('usuarios_auditoria');

      // Criar registro de auditoria
      const auditoria = {
        eventType: 'UsuarioCriado',
        timestamp: timestamp || new Date().toISOString(),
        usuarioId,
        nome,
        email,
        processedAt: new Date().toISOString(),
        originalEvent: message
      };

      // Inserir no MongoDB
      const result = await collection.insertOne(auditoria);
      context.log(`Auditoria registrada com ID: ${result.insertedId}`);

      // Atualizar métricas
      const metricsCollection = db.collection('metricas');
      const hoje = new Date().toISOString().split('T')[0];
      
      await metricsCollection.updateOne(
        { data: hoje },
        {
          $inc: { totalUsuariosCriados: 1 },
          $set: { ultimaAtualizacao: new Date().toISOString() }
        },
        { upsert: true }
      );

      context.log('Event processed successfully');
    } catch (error) {
      context.error('Error processing usuario-criado event:', error);
      throw error; // Rethrow para retry do Service Bus
    }
  }
});

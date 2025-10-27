const { connectDatabase } = require('../config/database');

module.exports = async function (context, message) {
    try {
        context.log('Processing usuario-criado event:', JSON.stringify(message));

        // Validar estrutura do evento
        if (!message || !message.eventType || message.eventType !== 'UsuarioCriado') {
            context.log.error('Invalid event structure:', message);
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

        context.log('Event processed successfully');
    } catch (error) {
        context.log.error('Error processing usuario-criado event:', error);
        throw error;
    }
};

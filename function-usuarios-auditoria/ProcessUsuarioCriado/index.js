const { connectDatabase } = require('../config/database');

module.exports = async function (context, message) {
    try {
        context.log('Processing usuario-criado event:', JSON.stringify(message));

        // Validar estrutura do evento
        if (!message || !message.eventType || message.eventType !== 'UsuarioCriado') {
            context.log('Invalid event structure:', JSON.stringify(message));
            return;
        }

        const { timestamp, data } = message;
        
        // Validar se data existe
        if (!data) {
            context.log('Event data is missing:', JSON.stringify(message));
            return;
        }

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
        // Garantir que o erro seja logado corretamente
        const errorMessage = error && error.message ? error.message : 'Unknown error';
        const errorStack = error && error.stack ? error.stack : 'No stack trace';
        context.log(`Error processing usuario-criado event: ${errorMessage}`);
        context.log(`Stack trace: ${errorStack}`);
        throw error;
    }
};

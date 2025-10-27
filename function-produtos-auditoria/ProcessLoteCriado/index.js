const { getPool } = require('../config/database');

module.exports = async function (context, message) {
    try {
        context.log('Processing lote-criado event:', JSON.stringify(message));

        // Validar estrutura do evento
        if (!message || !message.eventType || message.eventType !== 'LoteCriado') {
            context.log.error('Invalid event structure:', message);
            return;
        }

        const { timestamp, data } = message;
        const { loteId, nome, categoria, estoque, validade, valor } = data;

        const pool = await getPool();

        // Inserir auditoria
        await pool.request()
            .input('event_type', 'LoteCriado')
            .input('timestamp', timestamp || new Date().toISOString())
            .input('lote_id', loteId)
            .input('nome', nome)
            .input('categoria', categoria || null)
            .input('estoque', estoque)
            .input('validade', validade || null)
            .input('valor', valor)
            .input('original_event', JSON.stringify(message))
            .query(`
                INSERT INTO produtos_auditoria 
                (event_type, timestamp, lote_id, nome, categoria, estoque, validade, valor, original_event)
                VALUES 
                (@event_type, @timestamp, @lote_id, @nome, @categoria, @estoque, @validade, @valor, @original_event)
            `);

        context.log(`Auditoria registrada para lote: ${loteId}`);

        // Verificar e criar alerta de estoque baixo (threshold: 50 unidades)
        if (estoque <= 50) {
            await pool.request()
                .input('tipo', 'ESTOQUE_BAIXO')
                .input('lote_id', loteId)
                .input('nome', nome)
                .input('mensagem', `Estoque baixo: apenas ${estoque} unidades disponíveis`)
                .query(`
                    INSERT INTO alertas (tipo, lote_id, nome, mensagem)
                    VALUES (@tipo, @lote_id, @nome, @mensagem)
                `);
            context.log(`Alerta de estoque baixo criado para lote: ${loteId}`);
        }

        // Verificar e criar alerta de vencimento próximo (threshold: 30 dias)
        if (validade) {
            const validadeDate = new Date(validade);
            const hoje = new Date();
            const diasAteVencimento = Math.ceil((validadeDate - hoje) / (1000 * 60 * 60 * 24));

            if (diasAteVencimento <= 30 && diasAteVencimento >= 0) {
                await pool.request()
                    .input('tipo', 'VENCIMENTO_PROXIMO')
                    .input('lote_id', loteId)
                    .input('nome', nome)
                    .input('mensagem', `Vencimento próximo: ${diasAteVencimento} dias até ${validade}`)
                    .query(`
                        INSERT INTO alertas (tipo, lote_id, nome, mensagem)
                        VALUES (@tipo, @lote_id, @nome, @mensagem)
                    `);
                context.log(`Alerta de vencimento próximo criado para lote: ${loteId}`);
            }
        }

        context.log('Event processed successfully');
    } catch (error) {
        context.log.error('Error processing lote-criado event:', error);
        throw error; // Rethrow para retry do Service Bus
    }
};

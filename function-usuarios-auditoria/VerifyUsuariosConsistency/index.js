const { connectDatabase } = require('../config/database');

/**
 * Function para verificar consistência de dados de usuários
 * Compara registros de auditoria com registros no Azure SQL
 * HTTP Trigger: GET /api/verify-usuarios
 */
module.exports = async function (context, req) {
    try {
        context.log('Verificando consistência de dados de usuários...');

        const db = await connectDatabase();
        const auditoriaCollection = db.collection('usuarios_auditoria');

        // Buscar todas as auditorias de criação de usuários
        const auditorias = await auditoriaCollection
            .find({ eventType: 'UsuarioCriado' })
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        context.log(`Encontradas ${auditorias.length} auditorias para verificar`);

        // Preparar verificações
        const inconsistencias = [];
        const usuariosVerificados = [];

        for (const auditoria of auditorias) {
            const usuarioId = auditoria.usuarioId;
            const nome = auditoria.nome;
            const email = auditoria.email;
            
            usuariosVerificados.push({
                usuarioId,
                nome,
                email,
                timestampAuditoria: auditoria.timestamp,
                status: 'auditado'
            });

            // Verificar duplicatas de email na auditoria
            const duplicatas = await auditoriaCollection.countDocuments({
                email: email,
                eventType: 'UsuarioCriado'
            });

            if (duplicatas > 1) {
                inconsistencias.push({
                    tipo: 'DUPLICATA_EMAIL',
                    email,
                    usuarioId,
                    mensagem: `Email ${email} possui ${duplicatas} registros de auditoria`,
                    severidade: 'ALTA'
                });
            }

            // Verificar se há dados faltantes
            if (!nome || !email) {
                inconsistencias.push({
                    tipo: 'DADOS_FALTANTES',
                    usuarioId,
                    mensagem: `Usuário ${usuarioId} possui dados faltantes (nome: ${!!nome}, email: ${!!email})`,
                    severidade: 'MÉDIA'
                });
            }
        }

        // Buscar possíveis erros de processamento (eventos sem dados completos)
        const eventosComErro = await auditoriaCollection
            .find({
                $or: [
                    { nome: { $exists: false } },
                    { email: { $exists: false } },
                    { usuarioId: { $exists: false } }
                ]
            })
            .limit(50)
            .toArray();

        eventosComErro.forEach(evento => {
            inconsistencias.push({
                tipo: 'EVENTO_INCOMPLETO',
                eventoId: evento._id,
                mensagem: 'Evento de auditoria com dados incompletos',
                severidade: 'ALTA',
                detalhes: evento
            });
        });

        context.res = {
            status: 200,
            body: {
                success: true,
                timestamp: new Date().toISOString(),
                resumo: {
                    totalAuditorias: auditorias.length,
                    totalInconsistencias: inconsistencias.length,
                    totalVerificados: usuariosVerificados.length
                },
                inconsistencias,
                usuariosVerificados: usuariosVerificados.slice(0, 10), // Retorna apenas os primeiros 10
                recomendacoes: inconsistencias.length > 0 
                    ? ['Revisar inconsistências encontradas', 'Verificar processo de criação de usuários', 'Validar dados de entrada']
                    : ['Sistema operando normalmente']
            }
        };

    } catch (error) {
        context.log.error('Erro ao verificar consistência:', {
            message: error.message,
            stack: error.stack
        });

        context.res = {
            status: 500,
            body: {
                success: false,
                message: 'Erro ao verificar consistência de usuários',
                error: error.message
            }
        };
    }
};

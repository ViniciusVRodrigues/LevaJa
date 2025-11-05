const { getPool } = require('../config/database');

/**
 * Function para verificar consistência e erros de dados de produtos
 * Analisa registros de auditoria e alertas no Azure SQL
 * HTTP Trigger: GET /api/verify-produtos
 */
module.exports = async function (context, req) {
    try {
        context.log('Verificando consistência de dados de produtos...');

        const pool = await getPool();

        // 1. Buscar auditorias de produtos
        const auditoriasResult = await pool.request().query(`
            SELECT 
                event_type,
                lote_id,
                nome,
                categoria,
                estoque,
                validade,
                valor,
                timestamp,
                processed_at
            FROM produtos_auditoria
            ORDER BY timestamp DESC
        `);

        const auditorias = auditoriasResult.recordset;
        context.log(`Encontradas ${auditorias.length} auditorias de produtos`);

        // 2. Buscar alertas ativos
        const alertasResult = await pool.request().query(`
            SELECT 
                id,
                tipo,
                lote_id,
                nome,
                mensagem,
                created_at,
                resolved
            FROM alertas
            WHERE resolved IS NULL OR resolved = 0
            ORDER BY created_at DESC
        `);

        const alertas = alertasResult.recordset;
        context.log(`Encontrados ${alertas.length} alertas ativos`);

        // 3. Análise de inconsistências
        const inconsistencias = [];
        const produtosVerificados = [];

        // Análise de auditorias
        for (const auditoria of auditorias.slice(0, 100)) {
            produtosVerificados.push({
                loteId: auditoria.lote_id,
                nome: auditoria.nome,
                categoria: auditoria.categoria,
                estoque: auditoria.estoque,
                timestamp: auditoria.timestamp,
                status: 'auditado'
            });

            // Verificar dados faltantes
            if (!auditoria.nome || !auditoria.categoria) {
                inconsistencias.push({
                    tipo: 'DADOS_FALTANTES',
                    loteId: auditoria.lote_id,
                    mensagem: `Produto ${auditoria.lote_id} possui dados faltantes`,
                    severidade: 'MÉDIA',
                    detalhes: {
                        nome: !!auditoria.nome,
                        categoria: !!auditoria.categoria
                    }
                });
            }

            // Verificar estoque negativo
            if (auditoria.estoque < 0) {
                inconsistencias.push({
                    tipo: 'ESTOQUE_NEGATIVO',
                    loteId: auditoria.lote_id,
                    nome: auditoria.nome,
                    estoque: auditoria.estoque,
                    mensagem: `Produto ${auditoria.nome} com estoque negativo: ${auditoria.estoque}`,
                    severidade: 'ALTA'
                });
            }

            // Verificar valor inválido
            if (auditoria.valor <= 0) {
                inconsistencias.push({
                    tipo: 'VALOR_INVALIDO',
                    loteId: auditoria.lote_id,
                    nome: auditoria.nome,
                    valor: auditoria.valor,
                    mensagem: `Produto ${auditoria.nome} com valor inválido: ${auditoria.valor}`,
                    severidade: 'MÉDIA'
                });
            }

            // Verificar validade vencida
            if (auditoria.validade) {
                const validadeDate = new Date(auditoria.validade);
                const hoje = new Date();
                if (validadeDate < hoje) {
                    inconsistencias.push({
                        tipo: 'PRODUTO_VENCIDO',
                        loteId: auditoria.lote_id,
                        nome: auditoria.nome,
                        validade: auditoria.validade,
                        mensagem: `Produto ${auditoria.nome} está vencido desde ${auditoria.validade}`,
                        severidade: 'ALTA'
                    });
                }
            }
        }

        // 4. Verificar duplicatas de lote_id
        const duplicatasResult = await pool.request().query(`
            SELECT lote_id, COUNT(*) as total
            FROM produtos_auditoria
            GROUP BY lote_id
            HAVING COUNT(*) > 1
        `);

        duplicatasResult.recordset.forEach(dup => {
            inconsistencias.push({
                tipo: 'DUPLICATA_LOTE',
                loteId: dup.lote_id,
                mensagem: `Lote ${dup.lote_id} possui ${dup.total} registros de auditoria`,
                severidade: 'MÉDIA'
            });
        });

        // 5. Análise de alertas não resolvidos antigos (mais de 30 dias)
        const alertasAntigosResult = await pool.request().query(`
            SELECT 
                id,
                tipo,
                lote_id,
                nome,
                mensagem,
                created_at,
                DATEDIFF(day, created_at, GETDATE()) as dias_aberto
            FROM alertas
            WHERE (resolved IS NULL OR resolved = 0)
            AND DATEDIFF(day, created_at, GETDATE()) > 30
        `);

        alertasAntigosResult.recordset.forEach(alerta => {
            inconsistencias.push({
                tipo: 'ALERTA_NAO_RESOLVIDO',
                alertaId: alerta.id,
                loteId: alerta.lote_id,
                tipoAlerta: alerta.tipo,
                mensagem: `Alerta ${alerta.tipo} não resolvido há ${alerta.dias_aberto} dias`,
                severidade: 'ALTA',
                detalhes: alerta
            });
        });

        // 6. Estatísticas gerais
        const estatisticas = {
            totalAuditorias: auditorias.length,
            totalAlertasAtivos: alertas.length,
            totalInconsistencias: inconsistencias.length,
            produtosVerificados: produtosVerificados.length,
            distribuicaoSeveridade: {
                alta: inconsistencias.filter(i => i.severidade === 'ALTA').length,
                media: inconsistencias.filter(i => i.severidade === 'MÉDIA').length,
                baixa: inconsistencias.filter(i => i.severidade === 'BAIXA').length
            },
            tiposInconsistencias: [...new Set(inconsistencias.map(i => i.tipo))]
        };

        context.res = {
            status: 200,
            body: {
                success: true,
                timestamp: new Date().toISOString(),
                estatisticas,
                inconsistencias,
                alertasAtivos: alertas.slice(0, 10),
                produtosVerificados: produtosVerificados.slice(0, 10),
                recomendacoes: inconsistencias.length > 0 
                    ? [
                        'Revisar produtos com estoque negativo ou vencidos',
                        'Resolver alertas pendentes',
                        'Validar dados de entrada no sistema',
                        'Implementar rotina de limpeza de produtos vencidos'
                    ]
                    : ['Sistema operando normalmente']
            }
        };

    } catch (error) {
        context.log.error('Erro ao verificar consistência de produtos:', {
            message: error.message,
            stack: error.stack
        });

        context.res = {
            status: 500,
            body: {
                success: false,
                message: 'Erro ao verificar consistência de produtos',
                error: error.message
            }
        };
    }
};

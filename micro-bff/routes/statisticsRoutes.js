const express = require('express');
const router = express.Router();
const azureFunctionService = require('../services/azureFunctionService');

/**
 * Rotas para consultar estatísticas e auditorias das Azure Functions
 */

/**
 * GET /statistics/usuarios
 * Retorna estatísticas de auditoria de usuários da Function 1
 */
router.get('/usuarios', async (req, res, next) => {
  try {
    const result = await azureFunctionService.callFunction1({
      path: '/api/statistics',
      method: 'GET'
    });

    console.log('GetStatistics raw response:', JSON.stringify(result, null, 2));

    // Azure Function pode retornar { body: { success, statistics, verification } } ou { success, statistics, verification }
    const body = result?.body || result;
    const stats = body?.statistics || {};
    const verification = body?.verification || null;

    // Normalize response for frontend compatibility
    const normalized = {
      totalCreated: stats.totalUsuariosCriados || 0,
      createdToday: stats.usuariosCriadosHoje || 0,
      lastProcessed: stats.ultimaDataProcessamento || null,
      usuariosPorDia: stats.usuariosPorDia || [],
      // Include verification data if available
      verification: verification
    };
    
    console.log('Normalized statistics response:', JSON.stringify(normalized, null, 2));
    res.json(normalized);
  } catch (error) {
    console.error('Error in /statistics/usuarios:', error);
    next(error);
  }
});

/**
 * GET /statistics/usuarios-auditoria
 * Lista logs de auditoria de usuários
 */
router.get('/usuarios-auditoria', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const result = await azureFunctionService.callFunction1({
      path: '/api/usuarios-auditoria',
      method: 'GET',
      params: { limit, offset }
    });

    // Extract data array from wrapped response
    const data = Array.isArray(result?.data) ? result.data : [];
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /statistics/usuarios-auditoria/:id
 * Busca auditoria específica de usuário
 */
router.get('/usuarios-auditoria/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await azureFunctionService.callFunction1({
      path: `/api/usuarios-auditoria/${id}`,
      method: 'GET'
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /statistics/produtos-auditoria
 * Lista logs de auditoria de produtos
 */
router.get('/produtos-auditoria', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const result = await azureFunctionService.callFunction2({
      path: '/api/produtos-auditoria',
      method: 'GET',
      params: { limit, offset }
    });

    // Extract data array from wrapped response
    const data = Array.isArray(result?.data) ? result.data : [];
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /statistics/produtos-auditoria/:id
 * Busca auditoria específica de produto
 */
router.get('/produtos-auditoria/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await azureFunctionService.callFunction2({
      path: `/api/produtos-auditoria/${id}`,
      method: 'GET'
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /statistics/relatorios/estoque-baixo
 * Relatório de produtos com estoque baixo (retorna apenas array para compatibilidade)
 */
router.get('/relatorios/estoque-baixo', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const result = await azureFunctionService.callFunction2({
      path: '/api/relatorios/estoque-baixo',
      method: 'GET',
      params: { limit }
    });

    console.log('Estoque baixo raw response:', JSON.stringify(result, null, 2));

    // Normaliza a resposta para retornar array direto
    // A Azure Function pode retornar { body: { produtos, alertas, verification } } ou { produtos, alertas, verification }
    const body = result?.body || result;
    const produtos = Array.isArray(body?.produtos) 
      ? body.produtos 
      : Array.isArray(body?.recordset)
      ? body.recordset
      : [];
    
    console.log(`Returning ${produtos.length} products from estoque-baixo`);
    res.json(produtos);
  } catch (error) {
    console.error('Error in /relatorios/estoque-baixo:', error);
    next(error);
  }
});

/**
 * GET /statistics/relatorios/estoque-baixo-completo
 * Relatório completo de produtos com estoque baixo incluindo verificação
 */
router.get('/relatorios/estoque-baixo-completo', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const result = await azureFunctionService.callFunction2({
      path: '/api/relatorios/estoque-baixo',
      method: 'GET',
      params: { limit }
    });

    console.log('Estoque baixo completo raw response:', JSON.stringify(result, null, 2));

    // Normaliza estrutura se necessário
    const body = result?.body || result;
    
    // Retorna resposta completa com produtos, alertas e verificação
    res.json(body);
  } catch (error) {
    console.error('Error in /relatorios/estoque-baixo-completo:', error);
    next(error);
  }
});

/**
 * GET /statistics/relatorios/vencimentos-proximos
 * Relatório de produtos próximos do vencimento (retorna apenas array para compatibilidade)
 */
router.get('/relatorios/vencimentos-proximos', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const result = await azureFunctionService.callFunction2({
      path: '/api/relatorios/vencimentos-proximos',
      method: 'GET',
      params: { limit }
    });

    console.log('Vencimentos próximos raw response:', JSON.stringify(result, null, 2));

    // Normaliza a resposta para retornar array direto
    // A Azure Function pode retornar { body: { produtosProximos, produtosVencidos, verification } } ou { produtosProximos, ... }
    const body = result?.body || result;
    const produtos = Array.isArray(body?.produtosProximos) 
      ? body.produtosProximos 
      : Array.isArray(body?.recordset)
      ? body.recordset
      : [];
    
    console.log(`Returning ${produtos.length} products from vencimentos-proximos`);
    res.json(produtos);
  } catch (error) {
    console.error('Error in /relatorios/vencimentos-proximos:', error);
    next(error);
  }
});

/**
 * GET /statistics/relatorios/vencimentos-proximos-completo
 * Relatório completo de produtos próximos do vencimento incluindo verificação
 */
router.get('/relatorios/vencimentos-proximos-completo', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const result = await azureFunctionService.callFunction2({
      path: '/api/relatorios/vencimentos-proximos',
      method: 'GET',
      params: { limit }
    });

    console.log('Vencimentos próximos completo raw response:', JSON.stringify(result, null, 2));

    // Normaliza estrutura se necessário
    const body = result?.body || result;
    
    // Retorna resposta completa com produtos, alertas e verificação
    res.json(body);
  } catch (error) {
    console.error('Error in /relatorios/vencimentos-proximos-completo:', error);
    next(error);
  }
});

module.exports = router;

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

    // Extract statistics from wrapped response
    const stats = result?.statistics || result;
    res.json(stats);
  } catch (error) {
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
 * Relatório de produtos com estoque baixo
 */
router.get('/relatorios/estoque-baixo', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const result = await azureFunctionService.callFunction2({
      path: '/api/relatorios/estoque-baixo',
      method: 'GET',
      params: { limit }
    });

    // Normaliza a resposta para retornar array direto
    // A Azure Function retorna { produtos: [], alertas: [], ... }
    // Mas o frontend espera apenas o array de produtos
    const produtos = Array.isArray(result?.produtos) ? result.produtos : [];
    res.json(produtos);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /statistics/relatorios/vencimentos-proximos
 * Relatório de produtos próximos do vencimento
 */
router.get('/relatorios/vencimentos-proximos', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const result = await azureFunctionService.callFunction2({
      path: '/api/relatorios/vencimentos-proximos',
      method: 'GET',
      params: { limit }
    });

    // Normaliza a resposta para retornar array direto
    // A Azure Function retorna { produtosProximos: [], produtosVencidos: [], ... }
    // O frontend espera apenas o array de produtos próximos
    const produtos = Array.isArray(result?.produtosProximos) ? result.produtosProximos : [];
    res.json(produtos);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /statistics/verify-usuarios
 * Verifica consistência e erros de dados de usuários
 */
router.get('/verify-usuarios', async (req, res, next) => {
  try {
    const result = await azureFunctionService.callFunction1({
      path: '/api/verify-usuarios',
      method: 'GET'
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /statistics/verify-produtos
 * Verifica consistência e erros de dados de produtos
 */
router.get('/verify-produtos', async (req, res, next) => {
  try {
    const result = await azureFunctionService.callFunction2({
      path: '/api/verify-produtos',
      method: 'GET'
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

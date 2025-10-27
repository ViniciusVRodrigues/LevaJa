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

    res.json(result);
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

    res.json(result);
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

    res.json(result);
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

    res.json(result);
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

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const aggregationController = require('../controllers/aggregationController');

/**
 * Rotas de agregação de dados
 * Combina dados de múltiplas fontes (microserviços + functions)
 */

// Dashboard completo com dados agregados
router.get('/dashboard', aggregationController.getDashboard);

// Usuários com dados de auditoria
router.get('/usuarios-completo', aggregationController.getUsersWithAudit);

// Produtos com relatórios de auditoria
router.get('/produtos-completo', aggregationController.getProductsWithAudit);

module.exports = router;

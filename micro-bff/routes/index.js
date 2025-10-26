const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const azureRoutes = require('./azureRoutes');

/**
 * Configuração central de rotas
 */

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'BFF API Gateway'
  });
});

// Rotas de usuários
router.use('/usuarios', userRoutes);

// Rotas de lotes de produtos
router.use('/lotes-produtos', productRoutes);

// Rotas de integração com Azure
router.use('/azure', azureRoutes);

module.exports = router;

const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const azureRoutes = require('./azureRoutes');
const statisticsRoutes = require('./statisticsRoutes');
const aggregationRoutes = require('./aggregationRoutes');

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

// Rotas de usuários (proxy para micro-azure)
router.use('/usuarios', userRoutes);

// Rotas de lotes de produtos (proxy para micro-mongo)
router.use('/lotes-produtos', productRoutes);

// Rotas de integração com Azure (Service Bus e Functions HTTP direto)
router.use('/azure', azureRoutes);

// Rotas de estatísticas e auditorias (consulta Functions HTTP)
router.use('/statistics', statisticsRoutes);

// Rotas de agregação de dados (múltiplas fontes)
router.use('/agregacao', aggregationRoutes);

module.exports = router;

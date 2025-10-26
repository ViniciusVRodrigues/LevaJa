const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const logger = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

/**
 * Servidor Express.js - BFF (Backend for Frontend) API Gateway
 * Atua como intermediário entre o frontend e os microsserviços
 */

const app = express();

// ========== Middlewares de Segurança ==========
// Helmet - proteção contra vulnerabilidades comuns
app.use(helmet());

// CORS - configuração de origens permitidas
app.use(cors(config.cors));

// ========== Middlewares de Parsing ==========
// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// ========== Logging ==========
// Morgan - logging de requisições HTTP
app.use(logger);

// ========== Rotas ==========
// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'BFF API Gateway - Backend for Frontend',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      usuarios: '/api/v1/usuarios',
      lotesProdutos: '/api/v1/lotes-produtos'
    },
    documentation: '/swagger.yaml'
  });
});

// Rotas da API v1
app.use('/api/v1', routes);

// ========== Tratamento de Erros ==========
// Handler para rotas não encontradas (deve vir antes do errorHandler)
app.use(notFoundHandler);

// Handler centralizado de erros (deve ser o último middleware)
app.use(errorHandler);

// ========== Inicialização do Servidor ==========
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         BFF API Gateway - Backend for Frontend           ║
║                                                           ║
║  Servidor rodando em: http://localhost:${PORT}            ║
║  Ambiente: ${config.nodeEnv.padEnd(42)}  ║
║  Health Check: http://localhost:${PORT}/api/v1/health     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;

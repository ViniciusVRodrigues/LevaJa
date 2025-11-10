const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const config = require('./config');
const logger = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const serviceBusService = require('./services/serviceBusService');

// Carrega o arquivo swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

/**
 * Servidor Express.js - BFF (Backend for Frontend) API Gateway
 * Atua como intermediário entre o frontend e os microsserviços
 */

const app = express();

// ========== Middlewares de Segurança ==========
// Helmet - proteção contra vulnerabilidades comuns (desabilita CSP para Swagger UI)
app.use(helmet({
  contentSecurityPolicy: false,
}));

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

// ========== Swagger Documentation ==========
// Swagger UI disponível em /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BFF API Gateway - LevaJá',
  customfavIcon: 'https://swagger.io/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// Rota para o arquivo YAML bruto
app.get('/swagger.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.yaml'));
});

// ========== Rotas ==========
// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'BFF API Gateway - Backend for Frontend',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      usuarios: '/api/v1/usuarios',
      lotesProdutos: '/api/v1/lotes-produtos',
      agregacao: '/api/v1/agregacao',
      statistics: '/api/v1/statistics',
      azure: '/api/v1/azure'
    },
    documentation: {
      swagger: '/api-docs',
      yaml: '/swagger.yaml'
    }
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

const server = app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         BFF API Gateway - Backend for Frontend           ║
║                                                           ║
║  Servidor rodando em: http://localhost:${PORT}            ║
║  Ambiente: ${config.nodeEnv.padEnd(42)}  ║
║  Health Check: http://localhost:${PORT}/api/v1/health     ║
║  Swagger Docs: http://localhost:${PORT}/api-docs          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Inicializa Service Bus (opcional - não bloqueia o servidor se falhar)
  try {
    await serviceBusService.initialize();
  } catch (error) {
    console.warn('Service Bus initialization failed (not critical):', error.message);
  }
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(async () => {
    await serviceBusService.close();
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(async () => {
    await serviceBusService.close();
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await serviceBusService.close();
  });
});

module.exports = app;

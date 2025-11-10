const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { connect, close } = require('./db/connection');
const userRoutes = require('./routes/userRoutes');
const { specs, swaggerUi } = require('./swagger');

/**
 * Microserviço de Usuários - Azure SQL
 */

const app = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Desabilita CSP para Swagger UI funcionar
}));
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check do serviço
 *     description: Verifica se o serviço está operacional
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serviço operacional
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: micro-azure (usuarios)
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'micro-azure (usuarios)',
    timestamp: new Date().toISOString()
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customSiteTitle: 'API Docs - Microserviço Usuários',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Rotas
app.use('/usuarios', userRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Informações da API
 *     description: Retorna informações básicas e endpoints disponíveis
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 endpoints:
 *                   type: object
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Microserviço de Usuários - Azure SQL',
    endpoints: {
      swagger: '/api-docs',
      health: '/health',
      usuarios: '/usuarios'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

// Inicialização
const PORT = config.port;

async function startServer() {
  try {
    // NÃO conecta ao banco no startup - conexão lazy (sob demanda)
    // A conexão será criada automaticamente no primeiro request via getPool()

    // Inicia servidor
    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║   Microserviço de Usuários - Azure SQL      ║
║   Servidor: http://localhost:${PORT}         ║
║   Ambiente: ${config.nodeEnv}               ║
║   Conexão: Lazy (sob demanda)               ║
╚══════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM recebido, fechando servidor...');
      server.close(async () => {
        await close();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\nSIGINT recebido, fechando servidor...');
      server.close(async () => {
        await close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

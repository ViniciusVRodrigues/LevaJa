const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { connect, close } = require('./db/connection');
const productRoutes = require('./routes/productRoutes');

/**
 * Microserviço de Lotes de Produtos - MongoDB
 */

const app = express();

// Middlewares
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'micro-mongo (lotes-produtos)',
    timestamp: new Date().toISOString()
  });
});

// Rotas
app.use('/lotes-produtos', productRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Microserviço de Lotes de Produtos - MongoDB',
    endpoints: {
      health: '/health',
      lotesProdutos: '/lotes-produtos'
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
    // Conecta ao banco
    await connect();

    // Inicia servidor
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║   Microserviço de Produtos - MongoDB             ║
║   Servidor: http://localhost:${PORT}              ║
║   Ambiente: ${config.nodeEnv}                    ║
╚═══════════════════════════════════════════════════╝
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

const mongoose = require('mongoose');
const config = require('../config');

/**
 * Conecta ao MongoDB
 */
async function connect() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('✓ Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    throw error;
  }
}

/**
 * Fecha conexão
 */
async function close() {
  try {
    await mongoose.connection.close();
    console.log('Conexão com MongoDB fechada');
  } catch (error) {
    console.error('Erro ao fechar conexão:', error.message);
  }
}

// Event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB: Conexão estabelecida');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB: Erro de conexão:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB: Desconectado');
});

module.exports = {
  connect,
  close,
  mongoose
};

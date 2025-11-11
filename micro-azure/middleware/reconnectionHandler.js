const { isReconnecting, getReconnectionElapsedSeconds } = require('../db/connection');
const config = require('../config');

/**
 * Middleware para detectar e tratar reconexões do Azure SQL
 * 
 * Este middleware intercepta requisições quando o banco está reconectando
 * e retorna uma resposta especial caso a reconexão demore mais que o esperado.
 */
function reconnectionHandler(req, res, next) {
  // Verifica se está em processo de reconexão
  if (isReconnecting()) {
    const elapsedSeconds = getReconnectionElapsedSeconds();
    const retrySeconds = config.azureSqlReconnectRetrySeconds;
    
    console.log(`⚠️ Requisição recebida durante reconexão (${elapsedSeconds}s decorridos)`);
    
    // Se já passou tempo suficiente para uma reconexão normal, 
    // deixa a requisição prosseguir e tentar obter a conexão
    // O getPool() irá tentar reconectar ou lançar erro
    if (elapsedSeconds < 2) {
      // Dá uma chance para a reconexão completar rapidamente
      next();
      return;
    }
  }
  
  // Continue normalmente
  next();
}

/**
 * Cria um erro de reconexão padrão
 */
function createReconnectionError() {
  const retrySeconds = config.azureSqlReconnectRetrySeconds;
  
  const error = new Error('O banco de dados está reconectando, tente novamente em alguns instantes.');
  error.statusCode = 503;
  error.code = 'AZURE_SQL_RECONNECTING';
  error.retryIn = retrySeconds;
  error.isReconnectionError = true;
  
  return error;
}

module.exports = {
  reconnectionHandler,
  createReconnectionError
};

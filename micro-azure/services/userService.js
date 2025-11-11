const { getPool, sql, isReconnecting } = require('../db/connection');
const { createReconnectionError } = require('../middleware/reconnectionHandler');
const config = require('../config');

/**
 * Service para operações de usuários
 * Camada de serviço - Clean Architecture
 * Contém lógica de negócio e acesso a dados
 */

/**
 * Executa uma operação de banco com timeout e tratamento de reconexão
 */
async function executeWithTimeout(operation, operationName = 'database operation') {
  const timeout = config.requestTimeout;
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      // Se está reconectando e atingiu timeout, retorna erro especial
      if (isReconnecting()) {
        reject(createReconnectionError());
      } else {
        const error = new Error(`Timeout ao executar ${operationName}`);
        error.statusCode = 504;
        reject(error);
      }
    }, timeout);
  });
  
  try {
    return await Promise.race([operation(), timeoutPromise]);
  } catch (error) {
    // Se o erro já é um erro de reconexão, propaga
    if (error.isReconnectionError) {
      throw error;
    }
    
    // Se está reconectando e deu erro de conexão, retorna erro especial
    if (isReconnecting() && (
      error.message?.includes('connect') || 
      error.message?.includes('connection') ||
      error.message?.includes('ECONNREFUSED') ||
      error.code === 'ESOCKET' ||
      error.code === 'ETIMEOUT'
    )) {
      throw createReconnectionError();
    }
    
    // Propaga outros erros
    throw error;
  }
}

class UserService {
  /**
   * Lista todos os usuários com paginação
   * @param {number} limit - Limite de registros
   * @param {number} offset - Offset para paginação
   */
  async getAllUsers(limit = 10, offset = 0) {
    return executeWithTimeout(async () => {
      const pool = await getPool();

      // Query para total de registros
      const countResult = await pool.request()
        .query('SELECT COUNT(*) as total FROM usuarios');
      
      const total = countResult.recordset[0].total;

      // Query paginada
      const result = await pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, parseInt(offset))
        .query(`
          SELECT id, nome, email, createdAt, updatedAt
          FROM usuarios
          ORDER BY createdAt DESC
          OFFSET @offset ROWS
          FETCH NEXT @limit ROWS ONLY
        `);

      return {
        data: result.recordset,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    }, 'getAllUsers');
  }

  /**
   * Busca um usuário por ID
   * @param {number} id - ID do usuário
   */
  async getUserById(id) {
    return executeWithTimeout(async () => {
      const pool = await getPool();

      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, nome, email, createdAt, updatedAt FROM usuarios WHERE id = @id');

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0];
    }, 'getUserById');
  }

  /**
   * Verifica se um email já está cadastrado
   * @param {string} email - Email a verificar
   */
  async emailExists(email) {
    return executeWithTimeout(async () => {
      const pool = await getPool();

      const checkEmail = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT id FROM usuarios WHERE email = @email');

      return checkEmail.recordset.length > 0;
    }, 'emailExists');
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário {nome, email, senha}
   */
  async createUser(userData) {
    const { nome, email, senha } = userData;

    // Validação de campos obrigatórios
    if (!nome || !email || !senha) {
      throw new Error('Campos obrigatórios: nome, email, senha');
    }

    // Verifica se email já existe
    if (await this.emailExists(email)) {
      throw new Error('Email já cadastrado');
    }

    return executeWithTimeout(async () => {
      const pool = await getPool();

      // Insere usuário
      const result = await pool.request()
        .input('nome', sql.NVarChar, nome)
        .input('email', sql.NVarChar, email)
        .input('senha', sql.NVarChar, senha) // Em produção, deve ser hash
        .query(`
          INSERT INTO usuarios (nome, email, senha, createdAt, updatedAt)
          OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email, INSERTED.createdAt
          VALUES (@nome, @email, @senha, GETDATE(), GETDATE())
        `);

      return result.recordset[0];
    }, 'createUser');
  }

  /**
   * Atualiza um usuário existente
   * @param {number} id - ID do usuário
   * @param {Object} userData - Dados para atualizar {nome?, email?, senha?}
   */
  async updateUser(id, userData) {
    const { nome, email, senha } = userData;

    // Verifica se usuário existe
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return executeWithTimeout(async () => {
      const pool = await getPool();

      // Monta query dinâmica
      let query = 'UPDATE usuarios SET updatedAt = GETDATE()';
      const request = pool.request().input('id', sql.Int, id);

      if (nome) {
        query += ', nome = @nome';
        request.input('nome', sql.NVarChar, nome);
      }
      if (email) {
        query += ', email = @email';
        request.input('email', sql.NVarChar, email);
      }
      if (senha) {
        query += ', senha = @senha';
        request.input('senha', sql.NVarChar, senha);
      }

      query += ' OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email, INSERTED.updatedAt WHERE id = @id';

      const result = await request.query(query);

      return result.recordset[0];
    }, 'updateUser');
  }

  /**
   * Deleta um usuário
   * @param {number} id - ID do usuário
   */
  async deleteUser(id) {
    // Verifica se usuário existe
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return executeWithTimeout(async () => {
      const pool = await getPool();

      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM usuarios WHERE id = @id');

      return true;
    }, 'deleteUser');
  }
}

module.exports = new UserService();

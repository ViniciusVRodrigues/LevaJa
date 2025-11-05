const { getPool, sql } = require('../db/connection');

/**
 * Service para operações de usuários
 * Camada de serviço - Clean Architecture
 * Contém lógica de negócio e acesso a dados
 */

class UserService {
  /**
   * Lista todos os usuários com paginação
   * @param {number} limit - Limite de registros
   * @param {number} offset - Offset para paginação
   */
  async getAllUsers(limit = 10, offset = 0) {
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
  }

  /**
   * Busca um usuário por ID
   * @param {number} id - ID do usuário
   */
  async getUserById(id) {
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id, nome, email, createdAt, updatedAt FROM usuarios WHERE id = @id');

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
  }

  /**
   * Verifica se um email já está cadastrado
   * @param {string} email - Email a verificar
   */
  async emailExists(email) {
    const pool = await getPool();

    const checkEmail = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM usuarios WHERE email = @email');

    return checkEmail.recordset.length > 0;
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

    const pool = await getPool();

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM usuarios WHERE id = @id');

    return true;
  }
}

module.exports = new UserService();

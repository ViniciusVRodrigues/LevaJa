const { getPool, sql } = require('../db/connection');

/**
 * Controller para operações de usuários
 */

class UserController {
  /**
   * Lista todos os usuários (GET /usuarios)
   */
  async getAll(req, res) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const pool = getPool();

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

      res.json({
        data: result.recordset,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  /**
   * Busca usuário por ID (GET /usuarios/:id)
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      // Validate if ID is a valid integer
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID inválido - deve ser um número inteiro' });
      }

      const pool = getPool();

      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, nome, email, createdAt, updatedAt FROM usuarios WHERE id = @id');

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  /**
   * Cria novo usuário (POST /usuarios)
   */
  async create(req, res) {
    try {
      const { nome, email, senha } = req.body;

      // Validação básica
      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha' });
      }

      const pool = getPool();

      // Verifica se email já existe
      const checkEmail = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT id FROM usuarios WHERE email = @email');

      if (checkEmail.recordset.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

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

      res.status(201).json(result.recordset[0]);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  /**
   * Atualiza usuário (PUT /usuarios/:id)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, senha } = req.body;

      // Validate if ID is a valid integer
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID inválido - deve ser um número inteiro' });
      }

      const pool = getPool();

      // Verifica se usuário existe
      const checkUser = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id FROM usuarios WHERE id = @id');

      if (checkUser.recordset.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

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

      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  /**
   * Deleta usuário (DELETE /usuarios/:id)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Validate if ID is a valid integer
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID inválido - deve ser um número inteiro' });
      }

      const pool = getPool();

      // Verifica se usuário existe
      const checkUser = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id FROM usuarios WHERE id = @id');

      if (checkUser.recordset.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM usuarios WHERE id = @id');

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
}

module.exports = new UserController();

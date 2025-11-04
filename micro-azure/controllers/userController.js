const userService = require('../services/userService');

/**
 * Controller para operações de usuários
 * Camada de apresentação - Clean Architecture
 * Responsável apenas por receber requisições, validar entrada e retornar respostas
 */

class UserController {
  /**
   * Lista todos os usuários (GET /usuarios)
   */
  async getAll(req, res) {
    try {
      const { limit = 10, offset = 0 } = req.query;

      const result = await userService.getAllUsers(limit, offset);
      res.json(result);
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

      const user = await userService.getUserById(parseInt(id));

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
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
      const userData = req.body;

      const user = await userService.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      if (error.message.includes('obrigatórios') || error.message.includes('já cadastrado')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  /**
   * Atualiza usuário (PUT /usuarios/:id)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      // Validate if ID is a valid integer
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID inválido - deve ser um número inteiro' });
      }

      const user = await userService.updateUser(parseInt(id), userData);
      res.json(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      
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

      await userService.deleteUser(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
}

module.exports = new UserController();

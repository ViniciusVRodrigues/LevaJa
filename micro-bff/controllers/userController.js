const userService = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Controller para lógica de negócio relacionada a usuários
 */

class UserController {
  /**
   * Lista todos os usuários
   */
  async getUsers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      // Validação básica
      if (limit < 1 || limit > 100) {
        throw new AppError('O parâmetro limit deve estar entre 1 e 100', 400, 'BAD_REQUEST');
      }
      if (offset < 0) {
        throw new AppError('O parâmetro offset deve ser maior ou igual a 0', 400, 'BAD_REQUEST');
      }

      const data = await userService.getUsers(limit, offset);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userService.getUserById(id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria um novo usuário
   */
  async createUser(req, res, next) {
    try {
      const userData = req.body;

      // Validação básica dos campos obrigatórios
      if (!userData.nome || !userData.email || !userData.senha) {
        throw new AppError(
          'Campos obrigatórios faltando', 
          400, 
          'BAD_REQUEST',
          ['Os campos nome, email e senha são obrigatórios']
        );
      }

      // Validação de tamanho do nome
      if (userData.nome.length < 3 || userData.nome.length > 100) {
        throw new AppError(
          'Nome inválido',
          400,
          'BAD_REQUEST',
          ['O nome deve ter entre 3 e 100 caracteres']
        );
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new AppError(
          'Email inválido',
          400,
          'BAD_REQUEST',
          ['O email deve ser válido']
        );
      }

      // Validação de senha
      if (userData.senha.length < 8) {
        throw new AppError(
          'Senha inválida',
          400,
          'BAD_REQUEST',
          ['A senha deve ter no mínimo 8 caracteres']
        );
      }

      const data = await userService.createUser(userData);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza um usuário
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;

      // Validação básica dos campos obrigatórios
      if (!userData.nome || !userData.email || !userData.senha) {
        throw new AppError(
          'Campos obrigatórios faltando',
          400,
          'BAD_REQUEST',
          ['Os campos nome, email e senha são obrigatórios']
        );
      }

      // Validação de tamanho do nome
      if (userData.nome.length < 3 || userData.nome.length > 100) {
        throw new AppError(
          'Nome inválido',
          400,
          'BAD_REQUEST',
          ['O nome deve ter entre 3 e 100 caracteres']
        );
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new AppError(
          'Email inválido',
          400,
          'BAD_REQUEST',
          ['O email deve ser válido']
        );
      }

      // Validação de senha
      if (userData.senha.length < 8) {
        throw new AppError(
          'Senha inválida',
          400,
          'BAD_REQUEST',
          ['A senha deve ter no mínimo 8 caracteres']
        );
      }

      const data = await userService.updateUser(id, userData);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta um usuário
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

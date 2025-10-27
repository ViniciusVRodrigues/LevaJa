const userService = require('../services/userService');
const serviceBusService = require('../services/serviceBusService');
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');

/**
 * Controller para lógica de negócio relacionada a usuários
 */

// Regex de validação de email mais segura (evita ReDoS)
// Ref: https://emailregex.com/ - simplified version to prevent ReDoS
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Regex de validação de ID (formato MongoDB ObjectId)
const ID_REGEX = /^[a-fA-F0-9]{24}$/;

/**
 * Valida formato de ID
 */
function validateId(id) {
  if (!ID_REGEX.test(id)) {
    throw new AppError('ID inválido', 400, 'BAD_REQUEST', ['O ID deve ser um ObjectId válido']);
  }
}

/**
 * Validação de dados de usuário
 */
function validateUserData(userData) {
  const errors = [];

  // Validação de campos obrigatórios
  if (!userData.nome) {
    errors.push('O campo nome é obrigatório');
  }
  if (!userData.email) {
    errors.push('O campo email é obrigatório');
  }
  if (!userData.senha) {
    errors.push('O campo senha é obrigatório');
  }

  if (errors.length > 0) {
    throw new AppError('Campos obrigatórios faltando', 400, 'BAD_REQUEST', errors);
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

  // Validação de email
  if (!EMAIL_REGEX.test(userData.email)) {
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
}

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
      validateId(id);
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

      // Validação de dados
      validateUserData(userData);

      const data = await userService.createUser(userData);

      // Envia evento para Service Bus (criação via evento)
      try {
        await serviceBusService.sendMessage(config.azure.serviceBus.userQueue, {
          eventType: 'UsuarioCriado',
          timestamp: new Date().toISOString(),
          data: {
            usuarioId: data.id || data._id || data.insertedId,
            nome: userData.nome,
            email: userData.email
          }
        });
        console.log(`Evento UsuarioCriado enviado para Service Bus fila '${config.azure.serviceBus.userQueue}'`);
      } catch (busError) {
        // Não falha a criação se o Service Bus não estiver configurado
        console.warn('Não foi possível enviar evento para Service Bus:', busError.message);
      }

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
      validateId(id);
      const userData = req.body;

      // Validação de dados
      validateUserData(userData);

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
      validateId(id);
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

const axios = require('axios');
const config = require('../config');

/**
 * Service para comunicação com o microsserviço de usuários
 */

const userServiceClient = axios.create({
  baseURL: config.services.userService.url,
  timeout: config.services.userService.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

class UserService {
  /**
   * Lista todos os usuários com paginação
   */
  async getUsers(limit = 10, offset = 0) {
    try {
      const response = await userServiceClient.get('/usuarios', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      // Re-throw para ser tratado pelo middleware de erro
      throw error;
    }
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(id) {
    try {
      const response = await userServiceClient.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cria um novo usuário
   */
  async createUser(userData) {
    try {
      const response = await userServiceClient.post('/usuarios', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id, userData) {
    try {
      const response = await userServiceClient.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deleta um usuário
   */
  async deleteUser(id) {
    try {
      const response = await userServiceClient.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();

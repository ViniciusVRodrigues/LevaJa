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
    const response = await userServiceClient.get('/usuarios', {
      params: { limit, offset }
    });
    return response.data;
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(id) {
    const response = await userServiceClient.get(`/usuarios/${id}`);
    return response.data;
  }

  /**
   * Cria um novo usuário
   */
  async createUser(userData) {
    const response = await userServiceClient.post('/usuarios', userData);
    return response.data;
  }

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id, userData) {
    const response = await userServiceClient.put(`/usuarios/${id}`, userData);
    return response.data;
  }

  /**
   * Deleta um usuário
   */
  async deleteUser(id) {
    const response = await userServiceClient.delete(`/usuarios/${id}`);
    return response.data;
  }
}

module.exports = new UserService();

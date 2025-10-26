const axios = require('axios');
const config = require('../config');

/**
 * Service para comunicação com o microsserviço de lotes de produtos
 */

const productServiceClient = axios.create({
  baseURL: config.services.productService.url,
  timeout: config.services.productService.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

class ProductService {
  /**
   * Lista todos os lotes de produtos com paginação
   */
  async getProducts(limit = 10, offset = 0, categoria = null) {
    const params = { limit, offset };
    if (categoria) {
      params.categoria = categoria;
    }
    const response = await productServiceClient.get('/lotes-produtos', { params });
    return response.data;
  }

  /**
   * Busca um lote de produto por ID
   */
  async getProductById(id) {
    const response = await productServiceClient.get(`/lotes-produtos/${id}`);
    return response.data;
  }

  /**
   * Cria um novo lote de produto
   */
  async createProduct(productData) {
    const response = await productServiceClient.post('/lotes-produtos', productData);
    return response.data;
  }

  /**
   * Atualiza um lote de produto existente
   */
  async updateProduct(id, productData) {
    const response = await productServiceClient.put(`/lotes-produtos/${id}`, productData);
    return response.data;
  }

  /**
   * Deleta um lote de produto
   */
  async deleteProduct(id) {
    const response = await productServiceClient.delete(`/lotes-produtos/${id}`);
    return response.data;
  }

  /**
   * Atualiza o estoque de um lote de produto
   */
  async updateStock(id, estoque) {
    const response = await productServiceClient.patch(`/lotes-produtos/${id}/estoque`, { estoque });
    return response.data;
  }
}

module.exports = new ProductService();

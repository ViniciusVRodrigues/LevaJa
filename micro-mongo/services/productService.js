const LoteProduct = require('../models/LoteProduct');

/**
 * Service para operações de lotes de produtos
 * Camada de serviço - Clean Architecture
 * Contém lógica de negócio e acesso a dados
 */

class ProductService {
  /**
   * Lista todos os produtos com paginação e filtro opcional
   * @param {number} limit - Limite de registros
   * @param {number} offset - Offset para paginação
   * @param {string} categoria - Categoria para filtrar (opcional)
   */
  async getAllProducts(limit = 10, offset = 0, categoria = null) {
    // Filtro por categoria (opcional)
    const filter = categoria ? { categoria } : {};

    // Total de registros
    const total = await LoteProduct.countDocuments(filter);

    // Query paginada
    const products = await LoteProduct.find(filter)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return {
      data: products,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  }

  /**
   * Busca um produto por ID
   * @param {string} id - ID do produto
   */
  async getProductById(id) {
    const product = await LoteProduct.findById(id);
    return product;
  }

  /**
   * Cria um novo produto
   * @param {Object} productData - Dados do produto {nome, categoria, estoque, valor, validade?}
   */
  async createProduct(productData) {
    const { nome, categoria, estoque, valor, validade } = productData;

    // Validação básica
    if (!nome || !categoria || estoque === undefined || valor === undefined) {
      throw new Error('Campos obrigatórios: nome, categoria, estoque, valor');
    }

    // Validação de tipos
    if (typeof estoque !== 'number' || estoque < 0) {
      throw new Error('Estoque deve ser um número maior ou igual a 0');
    }

    if (typeof valor !== 'number' || valor < 0) {
      throw new Error('Valor deve ser um número maior ou igual a 0');
    }

    // Cria produto
    const product = new LoteProduct({
      nome,
      categoria,
      estoque,
      valor,
      validade: validade || null
    });

    await product.save();
    return product;
  }

  /**
   * Atualiza um produto existente
   * @param {string} id - ID do produto
   * @param {Object} productData - Dados para atualizar
   */
  async updateProduct(id, productData) {
    const product = await LoteProduct.findByIdAndUpdate(
      id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return product;
  }

  /**
   * Deleta um produto
   * @param {string} id - ID do produto
   */
  async deleteProduct(id) {
    const product = await LoteProduct.findByIdAndDelete(id);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return true;
  }

  /**
   * Atualiza o estoque de um produto
   * @param {string} id - ID do produto
   * @param {number} quantidade - Nova quantidade de estoque
   */
  async updateStock(id, quantidade) {
    if (typeof quantidade !== 'number' || quantidade < 0) {
      throw new Error('Quantidade deve ser um número maior ou igual a 0');
    }

    const product = await LoteProduct.findByIdAndUpdate(
      id,
      { estoque: quantidade },
      { new: true }
    );

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return product;
  }
}

module.exports = new ProductService();

const productService = require('../services/productService');
const mongoose = require('mongoose');

/**
 * Controller para operações de lotes de produtos
 * Camada de apresentação - Clean Architecture
 * Responsável apenas por receber requisições, validar entrada e retornar respostas
 */

class ProductController {
  /**
   * Lista todos os produtos (GET /lotes-produtos)
   */
  async getAll(req, res) {
    try {
      const { limit = 10, offset = 0, categoria } = req.query;

      const result = await productService.getAllProducts(limit, offset, categoria);
      res.json(result);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  /**
   * Busca produto por ID (GET /lotes-produtos/:id)
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      // Validate if ID is a valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido - formato não suportado' });
      }

      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(product);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido' });
      }
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  /**
   * Cria novo produto (POST /lotes-produtos)
   */
  async create(req, res) {
    try {
      const productData = req.body;

      const product = await productService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      
      if (error.message.includes('obrigatórios') || error.message.includes('deve ser')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  /**
   * Atualiza produto (PUT /lotes-produtos/:id)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;

      // Validate if ID is a valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido - formato não suportado' });
      }

      // Build update data
      const updateData = {};
      if (productData.nome !== undefined) updateData.nome = productData.nome;
      if (productData.categoria !== undefined) updateData.categoria = productData.categoria;
      if (productData.estoque !== undefined) updateData.estoque = productData.estoque;
      if (productData.valor !== undefined) updateData.valor = productData.valor;
      if (productData.validade !== undefined) updateData.validade = productData.validade ? new Date(productData.validade) : null;

      const product = await productService.updateProduct(id, updateData);
      res.json(product);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido' });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  /**
   * Atualiza estoque (PATCH /lotes-produtos/:id/estoque)
   */
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { estoque } = req.body;

      if (estoque === undefined) {
        return res.status(400).json({ error: 'Campo estoque é obrigatório' });
      }

      // Validate if ID is a valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido - formato não suportado' });
      }

      const product = await productService.updateStock(id, estoque);
      res.json(product);
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      
      if (error.message === 'Produto não encontrado' || error.message.includes('deve ser')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
  }

  /**
   * Deleta produto (DELETE /lotes-produtos/:id)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Validate if ID is a valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido - formato não suportado' });
      }

      await productService.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
}

module.exports = new ProductController();

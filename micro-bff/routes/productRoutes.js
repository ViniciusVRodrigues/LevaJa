const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * Rotas para operações de lotes de produtos
 */

// GET /api/v1/lotes-produtos - Lista todos os lotes de produtos
router.get('/', productController.getProducts.bind(productController));

// GET /api/v1/lotes-produtos/:id - Busca um lote de produto por ID
router.get('/:id', productController.getProductById.bind(productController));

// POST /api/v1/lotes-produtos - Cria um novo lote de produto
router.post('/', productController.createProduct.bind(productController));

// PUT /api/v1/lotes-produtos/:id - Atualiza um lote de produto
router.put('/:id', productController.updateProduct.bind(productController));

// DELETE /api/v1/lotes-produtos/:id - Deleta um lote de produto
router.delete('/:id', productController.deleteProduct.bind(productController));

// PATCH /api/v1/lotes-produtos/:id/estoque - Atualiza o estoque do lote
router.patch('/:id/estoque', productController.updateStock.bind(productController));

module.exports = router;

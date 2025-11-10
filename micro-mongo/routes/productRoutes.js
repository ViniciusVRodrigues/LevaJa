const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * Rotas de lotes de produtos
 */

/**
 * @swagger
 * /lotes-produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     description: Retorna lista paginada de lotes de produtos
 *     tags: [Lotes de Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/offsetParam'
 *       - $ref: '#/components/parameters/ativoParam'
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LoteProduto'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', productController.getAll);

/**
 * @swagger
 * /lotes-produtos/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     description: Retorna um produto específico pelo ID
 *     tags: [Lotes de Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoteProduto'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', productController.getById);

/**
 * @swagger
 * /lotes-produtos:
 *   post:
 *     summary: Cria novo produto
 *     description: Cria um novo lote de produto no sistema
 *     tags: [Lotes de Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoteProdutoInput'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoteProduto'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', productController.create);

/**
 * @swagger
 * /lotes-produtos/{id}:
 *   put:
 *     summary: Atualiza produto
 *     description: Atualiza dados de um produto existente
 *     tags: [Lotes de Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoteProdutoUpdate'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', productController.update);

/**
 * @swagger
 * /lotes-produtos/{id}/estoque:
 *   patch:
 *     summary: Atualiza estoque do produto
 *     description: Atualiza apenas a quantidade em estoque de um produto
 *     tags: [Lotes de Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstoqueUpdate'
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/:id/estoque', productController.updateStock);

/**
 * @swagger
 * /lotes-produtos/{id}:
 *   delete:
 *     summary: Deleta produto
 *     description: Remove um produto do sistema
 *     tags: [Lotes de Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', productController.delete);

module.exports = router;

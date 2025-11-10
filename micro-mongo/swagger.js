const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microserviço de Lotes de Produtos - MongoDB',
      version: '1.0.0',
      description: 'API REST para gerenciamento de lotes de produtos com persistência em MongoDB',
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'contato@levaja.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://micro-mongo.azurewebsites.net',
        description: 'Servidor de produção (Azure)'
      }
    ],
    components: {
      schemas: {
        LoteProduto: {
          type: 'object',
          required: ['nome', 'descricao', 'quantidade', 'valor', 'lote_id', 'validade'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único do produto (MongoDB ObjectId)',
              example: '507f1f77bcf86cd799439011'
            },
            nome: {
              type: 'string',
              description: 'Nome do produto',
              minLength: 3,
              maxLength: 100,
              example: 'Arroz Integral 5kg'
            },
            descricao: {
              type: 'string',
              description: 'Descrição detalhada do produto',
              minLength: 10,
              maxLength: 500,
              example: 'Arroz integral tipo 1, rico em fibras e vitaminas'
            },
            quantidade: {
              type: 'integer',
              description: 'Quantidade em estoque',
              minimum: 0,
              example: 150
            },
            valor: {
              type: 'number',
              format: 'double',
              description: 'Valor unitário do produto',
              minimum: 0.01,
              example: 25.90
            },
            lote_id: {
              type: 'string',
              description: 'Identificador único do lote',
              example: 'LOTE-2025-001'
            },
            validade: {
              type: 'string',
              format: 'date',
              description: 'Data de validade do lote',
              example: '2026-12-31'
            },
            ativo: {
              type: 'boolean',
              description: 'Indica se o produto está ativo',
              default: true,
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de criação do registro',
              example: '2025-11-09T12:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora da última atualização',
              example: '2025-11-09T14:30:00.000Z'
            }
          }
        },
        LoteProdutoInput: {
          type: 'object',
          required: ['nome', 'descricao', 'quantidade', 'valor', 'lote_id', 'validade'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do produto',
              minLength: 3,
              maxLength: 100,
              example: 'Arroz Integral 5kg'
            },
            descricao: {
              type: 'string',
              description: 'Descrição detalhada do produto',
              minLength: 10,
              maxLength: 500,
              example: 'Arroz integral tipo 1, rico em fibras e vitaminas'
            },
            quantidade: {
              type: 'integer',
              description: 'Quantidade em estoque',
              minimum: 0,
              example: 150
            },
            valor: {
              type: 'number',
              format: 'double',
              description: 'Valor unitário do produto',
              minimum: 0.01,
              example: 25.90
            },
            lote_id: {
              type: 'string',
              description: 'Identificador único do lote',
              example: 'LOTE-2025-001'
            },
            validade: {
              type: 'string',
              format: 'date',
              description: 'Data de validade do lote (YYYY-MM-DD)',
              example: '2026-12-31'
            },
            ativo: {
              type: 'boolean',
              description: 'Indica se o produto está ativo',
              default: true,
              example: true
            }
          }
        },
        LoteProdutoUpdate: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do produto',
              minLength: 3,
              maxLength: 100,
              example: 'Arroz Integral Premium 5kg'
            },
            descricao: {
              type: 'string',
              description: 'Descrição detalhada do produto',
              minLength: 10,
              maxLength: 500,
              example: 'Arroz integral orgânico tipo 1'
            },
            quantidade: {
              type: 'integer',
              description: 'Quantidade em estoque',
              minimum: 0,
              example: 200
            },
            valor: {
              type: 'number',
              format: 'double',
              description: 'Valor unitário do produto',
              minimum: 0.01,
              example: 29.90
            },
            validade: {
              type: 'string',
              format: 'date',
              description: 'Data de validade do lote',
              example: '2026-12-31'
            },
            ativo: {
              type: 'boolean',
              description: 'Indica se o produto está ativo',
              example: false
            }
          }
        },
        EstoqueUpdate: {
          type: 'object',
          required: ['quantidade'],
          properties: {
            quantidade: {
              type: 'integer',
              description: 'Nova quantidade em estoque',
              minimum: 0,
              example: 175
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Erro ao processar requisição'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de sucesso',
              example: 'Operação realizada com sucesso'
            }
          }
        }
      },
      parameters: {
        idParam: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID do produto (MongoDB ObjectId)',
          schema: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$'
          }
        },
        limitParam: {
          name: 'limit',
          in: 'query',
          description: 'Número de registros por página',
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100
          }
        },
        offsetParam: {
          name: 'offset',
          in: 'query',
          description: 'Número de registros a pular (paginação)',
          schema: {
            type: 'integer',
            default: 0,
            minimum: 0
          }
        },
        ativoParam: {
          name: 'ativo',
          in: 'query',
          description: 'Filtrar por status ativo/inativo',
          schema: {
            type: 'string',
            enum: ['true', 'false']
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Requisição inválida - dados ausentes ou incorretos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Todos os campos são obrigatórios'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Produto não encontrado'
              }
            }
          }
        },
        InternalError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Erro ao processar requisição'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Lotes de Produtos',
        description: 'Operações CRUD de lotes de produtos'
      },
      {
        name: 'Health',
        description: 'Health check e informações do serviço'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };

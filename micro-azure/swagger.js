const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microserviço de Usuários - Azure SQL',
      version: '1.0.0',
      description: 'API REST para gerenciamento de usuários com persistência em Azure SQL Server',
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
        url: 'https://micro-azure.azurewebsites.net',
        description: 'Servidor de produção (Azure)'
      }
    ],
    components: {
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário (auto-incremento)',
              example: 1
            },
            nome: {
              type: 'string',
              description: 'Nome completo do usuário',
              minLength: 3,
              maxLength: 100,
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único do usuário',
              example: 'joao.silva@example.com'
            },
            senha: {
              type: 'string',
              format: 'password',
              description: 'Senha do usuário (mínimo 6 caracteres)',
              minLength: 6,
              example: 'senha123'
            },
            data_criacao: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de criação do registro',
              example: '2025-11-09T12:00:00.000Z'
            }
          }
        },
        UsuarioInput: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome completo do usuário',
              minLength: 3,
              maxLength: 100,
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único do usuário',
              example: 'joao.silva@example.com'
            },
            senha: {
              type: 'string',
              format: 'password',
              description: 'Senha do usuário (mínimo 6 caracteres)',
              minLength: 6,
              example: 'senha123'
            }
          }
        },
        UsuarioUpdate: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Nome completo do usuário',
              minLength: 3,
              maxLength: 100,
              example: 'João Silva Santos'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao.santos@example.com'
            },
            senha: {
              type: 'string',
              format: 'password',
              description: 'Nova senha (mínimo 6 caracteres)',
              minLength: 6,
              example: 'novaSenha123'
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
          description: 'ID do usuário',
          schema: {
            type: 'integer',
            minimum: 1
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
                error: 'Nome, email e senha são obrigatórios'
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
                error: 'Usuário não encontrado'
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
        name: 'Usuários',
        description: 'Operações CRUD de usuários'
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

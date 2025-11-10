const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Configuração do Swagger/OpenAPI para o BFF API Gateway
 */

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'BFF API Gateway - LevaJá',
      version: '1.0.0',
      description: `
Backend for Frontend (BFF) API Gateway que agrega dados de múltiplos microserviços e Azure Functions.

## Arquitetura

Este BFF atua como intermediário entre o frontend e:
- **micro-azure**: Microserviço de Usuários (Azure SQL)
- **micro-mongo**: Microserviço de Produtos (MongoDB)
- **Azure Functions**: Functions de Auditoria e Relatórios

## Funcionalidades

- **Proxy**: Encaminha requisições aos microserviços
- **Agregação**: Combina dados de múltiplas fontes
- **Service Bus**: Publica eventos para processamento assíncrono
- **Azure Functions**: Integração via HTTP triggers
      `.trim(),
      contact: {
        name: 'Vinícius Viana Rodrigues',
        email: 'viniciusvrodrigues@github.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://bff-levaja.azurewebsites.net/api/v1',
        description: 'Servidor de Produção (Azure)',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Verificação de saúde do serviço',
      },
      {
        name: 'Usuários',
        description: 'Operações de usuários (proxy para micro-azure)',
      },
      {
        name: 'Produtos',
        description: 'Operações de produtos (proxy para micro-mongo)',
      },
      {
        name: 'Agregação',
        description: 'Endpoints que agregam dados de múltiplas fontes',
      },
      {
        name: 'Estatísticas',
        description: 'Consultas a Azure Functions de auditoria e relatórios',
      },
      {
        name: 'Azure',
        description: 'Integração com Azure Functions e Service Bus',
      },
    ],
    components: {
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID do usuário',
              example: 1,
            },
            nome: {
              type: 'string',
              description: 'Nome completo',
              example: 'João Silva',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@exemplo.com',
            },
            data_criacao: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
              example: '2025-11-10T00:00:00Z',
            },
          },
        },
        UsuarioInput: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            nome: {
              type: 'string',
              minLength: 3,
              maxLength: 100,
              example: 'João Silva',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@exemplo.com',
            },
            senha: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'senha123',
            },
          },
        },
        LoteProduto: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID do MongoDB',
              example: '507f1f77bcf86cd799439011',
            },
            nome: {
              type: 'string',
              example: 'Arroz 5kg',
            },
            descricao: {
              type: 'string',
              example: 'Arroz branco tipo 1',
            },
            quantidade: {
              type: 'integer',
              example: 100,
            },
            valor: {
              type: 'number',
              example: 25.90,
            },
            lote_id: {
              type: 'string',
              example: 'LOTE-2025-001',
            },
            validade: {
              type: 'string',
              format: 'date',
              example: '2026-12-31',
            },
            ativo: {
              type: 'boolean',
              example: true,
            },
          },
        },
        LoteProdutoInput: {
          type: 'object',
          required: ['nome', 'descricao', 'quantidade', 'valor', 'lote_id', 'validade'],
          properties: {
            nome: {
              type: 'string',
              minLength: 3,
              example: 'Arroz 5kg',
            },
            descricao: {
              type: 'string',
              example: 'Arroz branco tipo 1',
            },
            quantidade: {
              type: 'integer',
              minimum: 0,
              example: 100,
            },
            valor: {
              type: 'number',
              minimum: 0,
              example: 25.90,
            },
            lote_id: {
              type: 'string',
              example: 'LOTE-2025-001',
            },
            validade: {
              type: 'string',
              format: 'date',
              example: '2026-12-31',
            },
            ativo: {
              type: 'boolean',
              default: true,
            },
          },
        },
        DashboardData: {
          type: 'object',
          properties: {
            totalUsers: {
              type: 'integer',
              example: 150,
            },
            totalProducts: {
              type: 'integer',
              example: 500,
            },
            userStatistics: {
              type: 'object',
              properties: {
                statistics: {
                  type: 'object',
                  properties: {
                    totalUsuariosCriados: { type: 'integer', example: 150 },
                    usuariosCriadosHoje: { type: 'integer', example: 5 },
                  },
                },
                verification: {
                  type: 'object',
                  nullable: true,
                },
              },
            },
            lowStockAlerts: {
              type: 'array',
              items: { $ref: '#/components/schemas/LoteProduto' },
            },
            nearExpirationAlerts: {
              type: 'array',
              items: { $ref: '#/components/schemas/LoteProduto' },
            },
          },
        },
        Statistics: {
          type: 'object',
          properties: {
            totalCreated: {
              type: 'integer',
              example: 150,
            },
            createdToday: {
              type: 'integer',
              example: 5,
            },
            lastProcessed: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            usuariosPorDia: {
              type: 'array',
              items: { type: 'object' },
            },
            verification: {
              type: 'object',
              nullable: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Erro ao processar requisição',
            },
            code: {
              type: 'string',
              example: 'INTERNAL_ERROR',
            },
          },
        },
      },
      parameters: {
        limitParam: {
          name: 'limit',
          in: 'query',
          description: 'Número máximo de resultados',
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
        offsetParam: {
          name: 'offset',
          in: 'query',
          description: 'Número de resultados a pular',
          schema: {
            type: 'integer',
            default: 0,
            minimum: 0,
          },
        },
        idParam: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID do recurso',
          schema: {
            type: 'string',
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Requisição inválida',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                message: 'Dados inválidos',
                code: 'BAD_REQUEST',
              },
            },
          },
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                message: 'Recurso não encontrado',
                code: 'NOT_FOUND',
              },
            },
          },
        },
        InternalError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                message: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './server.js'], // Arquivos com anotações JSDoc
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi,
};

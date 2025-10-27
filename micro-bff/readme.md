# Micro Serviço Backend for Frontend API Gateway

## Descrição

Este é um servidor Express.js que funciona como BFF (Backend for Frontend) seguindo o padrão API Gateway. Ele atua como intermediário entre o frontend e os microsserviços de backend, agregando e simplificando as chamadas de API, além de integrar com Azure Functions e Azure Service Bus para arquitetura orientada a eventos.

## Funcionalidades

- ✅ API Gateway para gerenciamento de usuários e lotes de produtos
- ✅ Proxy e agregação de dados de múltiplos microsserviços
- ✅ Middleware de segurança (Helmet, CORS)
- ✅ Logging de requisições HTTP (Morgan)
- ✅ Tratamento de erros centralizado
- ✅ Validação de dados de entrada
- ✅ Configuração via variáveis de ambiente
- ✅ Endpoints RESTful conforme swagger.yaml
- ✅ **Integração com Azure Functions** (HTTP triggers)
- ✅ **Integração com Azure Service Bus** (mensageria assíncrona)
- ✅ **Agregação de dados** de múltiplas fontes (microserviços + functions)
- ✅ **Publicação de eventos** para filas do Service Bus

## Estrutura do Projeto

```
micro-bff/
├── config/
│   └── index.js                    # Configurações e variáveis de ambiente
├── controllers/
│   ├── userController.js           # Lógica de negócio para usuários
│   ├── productController.js        # Lógica de negócio para produtos
│   ├── azureController.js          # Integração Azure Functions/Service Bus
│   └── aggregationController.js    # Agregação de dados de múltiplas fontes
├── middleware/
│   ├── errorHandler.js             # Tratamento centralizado de erros
│   └── logger.js                   # Configuração de logging
├── routes/
│   ├── index.js                    # Rotas principais e health check
│   ├── userRoutes.js               # Rotas de usuários
│   ├── productRoutes.js            # Rotas de produtos
│   ├── azureRoutes.js              # Rotas de integração Azure
│   ├── statisticsRoutes.js         # Rotas de estatísticas/auditorias
│   └── aggregationRoutes.js        # Rotas de agregação de dados
├── services/
│   ├── userService.js              # Comunicação com micro-azure
│   ├── productService.js           # Comunicação com micro-mongo
│   ├── azureFunctionService.js     # Comunicação com Azure Functions
│   └── serviceBusService.js        # Envio de mensagens Service Bus
├── server.js                       # Arquivo principal do servidor
├── package.json                    # Dependências do projeto
├── .env.example                    # Exemplo de variáveis de ambiente
├── .gitignore                      # Arquivos ignorados pelo git
└── swagger.yaml                    # Especificação OpenAPI da API
```

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env` com as URLs dos seus microsserviços:
```env
PORT=3000
NODE_ENV=development
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
```

## Execução

### Modo de Desenvolvimento
```bash
npm run dev
```

### Modo de Produção
```bash
npm start
```

## Endpoints da API

### Health Check
- `GET /api/v1/health` - Verifica o status do servidor

### Usuários
- `GET /api/v1/usuarios` - Lista todos os usuários (com paginação)
- `GET /api/v1/usuarios/:id` - Busca um usuário por ID
- `POST /api/v1/usuarios` - Cria um novo usuário (**publica evento no Service Bus**)
- `PUT /api/v1/usuarios/:id` - Atualiza um usuário
- `DELETE /api/v1/usuarios/:id` - Deleta um usuário

### Lotes de Produtos
- `GET /api/v1/lotes-produtos` - Lista todos os lotes de produtos (com paginação e filtro)
- `GET /api/v1/lotes-produtos/:id` - Busca um lote de produto por ID
- `POST /api/v1/lotes-produtos` - Cria um novo lote de produto (**publica evento no Service Bus**)
- `PUT /api/v1/lotes-produtos/:id` - Atualiza um lote de produto
- `DELETE /api/v1/lotes-produtos/:id` - Deleta um lote de produto
- `PATCH /api/v1/lotes-produtos/:id/estoque` - Atualiza apenas o estoque

### Agregação de Dados (Múltiplas Fontes)
- `GET /api/v1/agregacao/dashboard` - Dashboard completo com dados agregados
- `GET /api/v1/agregacao/usuarios-completo` - Usuários + estatísticas de auditoria
- `GET /api/v1/agregacao/produtos-completo` - Produtos + relatórios de auditoria

### Estatísticas e Auditorias (Azure Functions)
- `GET /api/v1/statistics/usuarios` - Estatísticas de auditoria de usuários
- `GET /api/v1/statistics/usuarios-auditoria` - Lista logs de auditoria de usuários
- `GET /api/v1/statistics/usuarios-auditoria/:id` - Busca auditoria específica
- `GET /api/v1/statistics/produtos-auditoria` - Lista logs de auditoria de produtos
- `GET /api/v1/statistics/produtos-auditoria/:id` - Busca auditoria específica
- `GET /api/v1/statistics/relatorios/estoque-baixo` - Relatório de estoque baixo
- `GET /api/v1/statistics/relatorios/vencimentos-proximos` - Relatório de vencimentos

### Azure Service Bus (Mensageria)
- `POST /api/v1/azure/send-message` - Envia mensagem para Service Bus
- `POST /api/v1/azure/send-batch` - Envia lote de mensagens

### Azure Functions (HTTP Direto)
- `POST /api/v1/azure/function1` - Chama Azure Function 1
- `POST /api/v1/azure/function2` - Chama Azure Function 2
- `POST /api/v1/azure/process-and-notify` - Fluxo completo (Function + Service Bus)

## Exemplos de Uso

### Listar Usuários com Paginação
```bash
curl "http://localhost:3000/api/v1/usuarios?limit=10&offset=0"
```

### Criar um Novo Usuário
**Cria usuário e publica evento `UsuarioCriado` para Service Bus**
```bash
curl -X POST http://localhost:3000/api/v1/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao.silva@exemplo.com",
    "senha": "SenhaSegura123!"
  }'
```

### Criar um Lote de Produto
**Cria produto e publica evento `LoteCriado` para Service Bus**
```bash
curl -X POST http://localhost:3000/api/v1/lotes-produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Arroz Integral 1kg",
    "categoria": "Alimentos",
    "estoque": 500,
    "validade": "2026-12-31",
    "valor": 15.99
  }'
```

### Atualizar Estoque
```bash
curl -X PATCH http://localhost:3000/api/v1/lotes-produtos/507f1f77bcf86cd799439011/estoque \
  -H "Content-Type: application/json" \
  -d '{
    "estoque": 150
  }'
```

### Buscar Dashboard Agregado
**Agrega dados de microserviços e Azure Functions**
```bash
curl http://localhost:3000/api/v1/agregacao/dashboard
```

### Buscar Relatório de Estoque Baixo
**Consulta Azure Function para produtos com estoque ≤ 50**
```bash
curl http://localhost:3000/api/v1/statistics/relatorios/estoque-baixo
```

### Buscar Estatísticas de Usuários
**Consulta Azure Function para métricas de auditoria**
```bash
curl http://localhost:3000/api/v1/statistics/usuarios
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| PORT | Porta do servidor | 3000 |
| NODE_ENV | Ambiente de execução | development |
| USER_SERVICE_URL | URL do microsserviço de usuários | http://localhost:3001 |
| PRODUCT_SERVICE_URL | URL do microsserviço de produtos | http://localhost:3002 |
| CORS_ORIGIN | Origens permitidas para CORS | * |
| REQUEST_TIMEOUT | Timeout para requisições aos microsserviços (ms) | 5000 |
| LOG_LEVEL | Nível de log | info |

## Segurança

- **Helmet**: Adiciona headers de segurança HTTP
- **CORS**: Controle de origens permitidas
- **Validação de Dados**: Validação de entrada em todos os endpoints
- **Tratamento de Erros**: Não expõe stack traces em produção

## Deploy

O servidor está pronto para deploy em ambientes cloud como:
- AWS (EC2, ECS, Lambda)
- Azure (App Service, Container Instances)
- Google Cloud (App Engine, Cloud Run)
- Heroku

Certifique-se de configurar as variáveis de ambiente adequadamente para o ambiente de produção.

## Desenvolvimento

### Estrutura de Código

- **config/**: Configurações centralizadas
- **controllers/**: Lógica de negócio e validações
- **middleware/**: Middlewares customizados (erros, logging)
- **routes/**: Definição de rotas da API
- **services/**: Comunicação com microsserviços downstream

### Boas Práticas Implementadas

- ✅ Separação de responsabilidades (Controllers, Services, Routes)
- ✅ Tratamento centralizado de erros
- ✅ Validação de dados de entrada
- ✅ Logging estruturado
- ✅ Configuração via variáveis de ambiente
- ✅ Mensagens de erro claras e informativas
- ✅ Código modular e reutilizável

## Documentação da API

A especificação completa da API está disponível no arquivo `swagger.yaml` no formato OpenAPI 3.0.3.

## Licença

ISC
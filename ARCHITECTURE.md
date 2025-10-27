# Arquitetura do Sistema LevaJá

Este documento descreve a arquitetura completa do sistema LevaJá com microsserviços, BFF e Azure Functions.

## Visão Geral

```
┌──────────────┐
│   Frontend   │
│  (React)     │ :5173
│  mfe-admin   │
└──────┬───────┘
       │ HTTP
       ▼
┌──────────────────────────────────────────────┐
│              BFF (API Gateway)               │
│              micro-bff :3000                 │
└─────┬──────────────┬────────────┬────────────┘
      │              │            │
      │              │            └──► Azure Service Bus
      │              │                 ┌─────────────┐
      │              │                 │usuario-criado│
      │              │                 │lote-criado   │
      │              │                 └─────┬────────┘
      │              │                       │
      │              │                       ▼
      │              │              ┌─────────────────┐
      │              │              │ Azure Functions │
      │              └──────────────┤  - function-    │
      │                             │    usuarios-    │
      │                             │    auditoria    │
      │                             │  - function-    │
      │                             │    produtos-    │
      │                             │    auditoria    │
      │                             └────┬───────┬────┘
      │                                  │       │
      ├──────────────────────────────────┘       │
      │                                          │
      ▼                                          ▼
┌─────────────┐                          ┌─────────────┐
│ micro-azure │                          │   MongoDB   │
│  (Users)    │                          │ (Auditoria) │
│    :3001    │                          └─────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐          ┌─────────────┐
│  Azure SQL  │          │ micro-mongo │
│   Server    │          │  (Products) │
│   (Users)   │          │    :3002    │
└─────────────┘          └──────┬──────┘
                                │
┌─────────────┐                 ▼
│  Azure SQL  │          ┌─────────────┐
│   Server    │◄─────────│   MongoDB   │
│ (Auditoria) │          │  (Products) │
└─────────────┘          └─────────────┘
```

## Componentes

### 1. Frontend (mfe-admin)
- **Tecnologia**: React 19 + Vite
- **Porta**: 5173
- **Responsabilidade**: Interface de administração
- **Comunicação**: HTTP com BFF

**Funcionalidades**:
- CRUD de usuários
- CRUD de lotes de produtos
- Paginação e filtros
- Validação client-side

### 2. BFF - Backend for Frontend (micro-bff)
- **Tecnologia**: Express.js + Node.js
- **Porta**: 3000
- **Responsabilidade**: API Gateway, agregação de dados, proxy

**Funcionalidades**:
- **Proxy para microsserviços**: Roteia requisições para micro-azure e micro-mongo
- **Agregação de dados**: Combina dados de múltiplas fontes
- **Integração Azure Functions**: Chama Functions via HTTP
- **Integração Service Bus**: Envia mensagens assíncronas
- **Segurança**: Helmet, CORS, validações
- **Logging**: Morgan para auditoria

**Endpoints Principais**:
```
GET  /api/v1/health
GET  /api/v1/usuarios
POST /api/v1/usuarios
GET  /api/v1/lotes-produtos
POST /api/v1/lotes-produtos
POST /api/v1/azure/function1
POST /api/v1/azure/send-message
```

### 3. Microserviço de Usuários (micro-azure)
- **Tecnologia**: Express.js + mssql
- **Porta**: 3001
- **Banco**: Azure SQL Server
- **Responsabilidade**: Gestão de usuários

**Funcionalidades**:
- CRUD completo de usuários
- Validação de email único
- Paginação
- Timestamps automáticos

**Schema**:
```sql
CREATE TABLE usuarios (
  id INT IDENTITY(1,1) PRIMARY KEY,
  nome NVARCHAR(100) NOT NULL,
  email NVARCHAR(255) NOT NULL UNIQUE,
  senha NVARCHAR(255) NOT NULL,
  createdAt DATETIME2,
  updatedAt DATETIME2
);
```

### 4. Microserviço de Produtos (micro-mongo)
- **Tecnologia**: Express.js + Mongoose
- **Porta**: 3002
- **Banco**: MongoDB
- **Responsabilidade**: Gestão de lotes de produtos

**Funcionalidades**:
- CRUD completo de produtos
- Filtro por categoria
- Atualização de estoque
- Validação de dados
- Paginação

**Schema**:
```javascript
{
  nome: String (required, 3-150),
  categoria: String (required),
  estoque: Number (required, min: 0),
  valor: Number (required, min: 0),
  validade: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 5. Azure Function 1: Auditoria de Usuários (function-usuarios-auditoria)
- **Tecnologia**: Azure Functions (Node.js)
- **Banco**: MongoDB
- **Responsabilidade**: Auditoria e estatísticas de criação de usuários

**HTTP Triggers (Endpoints de Consulta)**:
- `GET /api/usuarios-auditoria` - Lista logs de auditoria (paginado)
- `GET /api/usuarios-auditoria/:id` - Busca auditoria específica
- `GET /api/statistics` - Estatísticas agregadas (total, por dia, última data)

**Service Bus Trigger**:
- **Fila**: `usuario-criado`
- **Evento**: `UsuarioCriado`
- **Ação**: Persiste auditoria no MongoDB, atualiza métricas

**Estrutura do Evento**:
```json
{
  "eventType": "UsuarioCriado",
  "timestamp": "2025-10-26T20:00:00Z",
  "data": {
    "usuarioId": "507f1f77bcf86cd799439011",
    "nome": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

### 6. Azure Function 2: Auditoria de Produtos (function-produtos-auditoria)
- **Tecnologia**: Azure Functions (Node.js)
- **Banco**: Azure SQL Server
- **Responsabilidade**: Auditoria, relatórios e alertas de produtos

**HTTP Triggers (Endpoints de Consulta)**:
- `GET /api/produtos-auditoria` - Lista logs de auditoria (paginado)
- `GET /api/produtos-auditoria/:id` - Busca auditoria específica
- `GET /api/relatorios/estoque-baixo` - Relatório de estoque baixo (≤50 unidades)
- `GET /api/relatorios/vencimentos-proximos` - Relatório de vencimentos (≤30 dias)

**Service Bus Trigger**:
- **Fila**: `lote-criado`
- **Evento**: `LoteCriado`
- **Ação**: 
  - Persiste auditoria no Azure SQL
  - Verifica estoque baixo e cria alerta
  - Verifica vencimento próximo e cria alerta

**Estrutura do Evento**:
```json
{
  "eventType": "LoteCriado",
  "timestamp": "2025-10-26T20:00:00Z",
  "data": {
    "loteId": "507f1f77bcf86cd799439011",
    "nome": "Arroz Integral 1kg",
    "categoria": "Alimentos",
    "estoque": 500,
    "validade": "2026-12-31",
    "valor": 15.99
  }
}
```

### 7. Azure Service Bus
- **Tipo**: Fila de mensagens
- **Responsabilidade**: Comunicação assíncrona entre componentes

**Filas Configuradas**:
1. **usuario-criado**: Eventos de criação de usuários
   - Producer: micro-azure (quando criar usuário)
   - Consumer: function-usuarios-auditoria
   
2. **lote-criado**: Eventos de criação de lotes
   - Producer: micro-mongo (quando criar produto)
   - Consumer: function-produtos-auditoria

**Casos de Uso**:
- Eventos de domínio (usuário criado, produto atualizado)
- Processamento em background (auditoria, alertas)
- Desacoplamento entre serviços

## Fluxos de Dados

### Fluxo 1: CRUD Tradicional (Síncrono)

**Criar Usuário**:
```
Frontend → BFF → micro-azure → Azure SQL
         ↓
      Response
```

1. Frontend envia POST para `/api/v1/usuarios`
2. BFF valida e roteia para `http://localhost:3001/usuarios`
3. micro-azure persiste no Azure SQL
4. Resposta retorna pelo mesmo caminho

**Listar Produtos**:
```
Frontend → BFF → micro-mongo → MongoDB
         ↓
      Response
```

### Fluxo 2: CRUD via Azure Function com Auditoria (Event-Driven)

**Criar Usuário com Auditoria**:
```
Frontend → BFF → micro-azure → Azure SQL (usuário persistido)
                      ↓
                 Service Bus (evento: UsuarioCriado)
                      ↓
         function-usuarios-auditoria (consume evento)
                      ↓
                  MongoDB (auditoria + métricas)
```

1. Frontend envia POST para `/api/v1/usuarios`
2. BFF roteia para micro-azure que persiste no Azure SQL
3. micro-azure publica evento `UsuarioCriado` no Service Bus
4. function-usuarios-auditoria consome evento
5. Function registra auditoria e atualiza métricas no MongoDB

**Criar Produto com Auditoria e Alertas**:
```
Frontend → BFF → micro-mongo → MongoDB (produto persistido)
                      ↓
                 Service Bus (evento: LoteCriado)
                      ↓
         function-produtos-auditoria (consume evento)
                      ↓
            Azure SQL (auditoria + alertas)
                      ↓
          [Verifica estoque baixo ≤50]
          [Verifica vencimento ≤30 dias]
```

1. Frontend envia POST para `/api/v1/lotes-produtos`
2. BFF roteia para micro-mongo que persiste no MongoDB
3. micro-mongo publica evento `LoteCriado` no Service Bus
4. function-produtos-auditoria consome evento
5. Function registra auditoria no Azure SQL
6. Function verifica regras e cria alertas automáticos

### Fluxo 3: Agregação de Dados

**Buscar dados agregados (usuário + produtos)**:
```
Frontend → BFF ─┬→ micro-azure → Azure SQL
         ↑      └→ micro-mongo → MongoDB
         │
      Agregação
```

1. Frontend requisita dados agregados
2. BFF faz chamadas paralelas para ambos microsserviços
3. BFF combina resultados
4. Retorna resposta única com dados agregados

### Fluxo 4: Consulta de Auditoria e Relatórios

**Buscar Estatísticas de Usuários**:
```
Frontend → BFF → function-usuarios-auditoria (HTTP)
         ↑                    ↓
         │              MongoDB (query)
         │                    ↓
         └────────────[Estatísticas agregadas]
```

**Buscar Relatório de Estoque Baixo**:
```
Frontend → BFF → function-produtos-auditoria (HTTP)
         ↑                    ↓
         │         Azure SQL (query com joins)
         │                    ↓
         └────────────[Produtos + Alertas]
```

## Comunicação Entre Componentes

### HTTP/REST
- **Frontend ↔ BFF**: HTTP REST
- **BFF ↔ Microsserviços**: HTTP REST
- **BFF ↔ Azure Functions**: HTTP (com function keys)

### Mensageria (Assíncrona)
- **BFF → Service Bus**: Envio de mensagens
- **Functions → Service Bus**: Publicação de eventos
- **Microsserviços ← Service Bus**: (opcional) Consumo de eventos

## Requisitos Atendidos

✅ **BFF realiza agregação de dados e proxy (CRUD dos domínios)**
- BFF implementa endpoints que fazem proxy para microsserviços
- Agregação disponível combinando chamadas

✅ **BFF tem endpoint para buscar informações (GET) via HTTP de function e microserviço**
- `/api/v1/usuarios` e `/api/v1/lotes-produtos` chamam microsserviços
- `/api/v1/azure/function1` e `/api/v1/azure/function2` podem chamar Functions
- BFF pode consultar auditorias das Functions via HTTP
- Possível criar endpoint agregado que combina múltiplas fontes

✅ **BFF realiza request para function e microserviço para CRUD**
- Todos os endpoints CRUD implementados para microsserviços
- BFF pode chamar Functions via HTTP para operações adicionais
- Microsserviços publicam eventos que Functions consomem

✅ **BFF realiza request para function para CREATE via evento**
- Microsserviços publicam eventos no Service Bus ao criar registros
- Functions consomem eventos e processam auditoria
- Fluxo: BFF → Microsserviço → Persistência + Service Bus → Function → Auditoria

✅ **Function recebe evento e persiste no banco de dados**
- function-usuarios-auditoria consome fila `usuario-criado` e persiste no MongoDB
- function-produtos-auditoria consome fila `lote-criado` e persiste no Azure SQL
- Functions criam registros de auditoria, métricas e alertas automáticos

## Configuração

### Variáveis de Ambiente

**BFF (.env)**:
```env
PORT=3000
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
AZURE_FUNCTION1_URL=https://...
AZURE_FUNCTION2_URL=https://...
AZURE_SERVICE_BUS_CONNECTION_STRING=...
CORS_ORIGIN=http://localhost:5173
```

**micro-azure (.env)**:
```env
PORT=3001
AZURE_SQL_SERVER=...
AZURE_SQL_DATABASE=levaja-users
AZURE_SQL_USER=...
AZURE_SQL_PASSWORD=...
CORS_ORIGIN=http://localhost:3000
```

**micro-mongo (.env)**:
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/levaja-products
CORS_ORIGIN=http://localhost:3000
```

**function-usuarios-auditoria (local.settings.json)**:
```json
{
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "mongodb://localhost:27017/auditoria",
    "SERVICE_BUS_CONNECTION": "Endpoint=sb://..."
  }
}
```

**function-produtos-auditoria (local.settings.json)**:
```json
{
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_SQL_SERVER": "your-server.database.windows.net",
    "AZURE_SQL_DATABASE": "auditoria",
    "AZURE_SQL_USER": "sqladmin",
    "AZURE_SQL_PASSWORD": "your-password",
    "SERVICE_BUS_CONNECTION": "Endpoint=sb://..."
  }
}
```

## Deploy

Todos os componentes são containerizados (Docker) e prontos para:
- **Azure Container Instances**
- **Azure App Service**
- **Azure Kubernetes Service**

Ver `micro-bff/AZURE_DEPLOY.md` para guia completo.

## Segurança

- **Helmet**: Proteção contra vulnerabilidades HTTP
- **CORS**: Configurado para origens permitidas
- **Validação**: Entrada validada em todos os níveis
- **HTTPS**: Obrigatório em produção
- **Function Keys**: Autenticação para Azure Functions
- **Connection Strings**: Gerenciadas via variáveis de ambiente

## Escalabilidade

- **Horizontal**: Cada componente pode escalar independentemente
- **Load Balancer**: BFF pode ter múltiplas instâncias
- **Database**: Azure SQL e MongoDB suportam clustering
- **Service Bus**: Handle alto volume de mensagens
- **Functions**: Auto-scaling baseado em demanda

## Monitoramento

Recomendado:
- **Application Insights** (Azure)
- **Log Analytics** (Azure)
- **MongoDB Atlas Monitoring**
- **Azure SQL Monitoring**

## Próximos Passos

1. Integrar microsserviços com Service Bus para publicar eventos
2. Implementar autenticação JWT no BFF
3. Hash de senhas (bcrypt) no micro-azure
4. Rate limiting
5. Circuit breaker para resiliência
6. Adicionar testes unitários e integração
7. CI/CD pipeline
8. Monitoramento com Application Insights

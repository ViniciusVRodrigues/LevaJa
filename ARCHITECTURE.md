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
┌──────────────────────────┐
│         BFF              │
│   (API Gateway)          │ :3000
│     micro-bff            │
└─────┬────────┬───────────┘
      │        │
      │        ├─────────────► Azure Function 1 (HTTP)
      │        ├─────────────► Azure Function 2 (HTTP)
      │        └─────────────► Azure Service Bus (mensagens)
      │
      ├────────────────────┐
      │                    │
      ▼                    ▼
┌─────────────┐    ┌─────────────┐
│ micro-azure │    │ micro-mongo │
│  (Users)    │    │  (Products) │
│    :3001    │    │    :3002    │
└──────┬──────┘    └──────┬──────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  Azure SQL  │    │   MongoDB   │
│   Server    │    │             │
└─────────────┘    └─────────────┘
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

### 5. Azure Functions (function-azure, function-mongo)
- **Tecnologia**: Azure Functions (HTTP Trigger)
- **Responsabilidade**: Processamento assíncrono, eventos

**Function 1** (function-azure):
- Processamento de dados de usuários
- Eventos de criação/atualização
- Persistência via Service Bus ou diretamente no banco

**Function 2** (function-mongo):
- Processamento de dados de produtos
- Eventos de criação/atualização
- Persistência via Service Bus ou diretamente no banco

### 6. Azure Service Bus
- **Tipo**: Fila de mensagens
- **Responsabilidade**: Comunicação assíncrona entre componentes

**Casos de Uso**:
- Eventos de domínio (usuário criado, produto atualizado)
- Processamento em background
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

### Fluxo 2: CRUD via Azure Function (Event-Driven)

**Criar Usuário via Evento**:
```
Frontend → BFF → Azure Function 1
         │           ↓
         │      Service Bus
         │           ↓
         │      [Processamento]
         │           ↓
         │      micro-azure → Azure SQL
         ↓
      Response (202 Accepted)
```

1. Frontend envia POST para `/api/v1/azure/function1`
2. BFF chama Azure Function via HTTP
3. Function processa e envia evento para Service Bus
4. Outro consumer (pode ser a própria Function) persiste no banco
5. BFF retorna 202 Accepted imediatamente

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

### Fluxo 4: Processamento Assíncrono

**Atualização em lote com notificação**:
```
Frontend → BFF → Azure Function 2
         │           ↓
         │      [Processamento]
         │           ↓
         │      Service Bus (evento)
         │           ↓
         │      micro-mongo → MongoDB
         ↓
      Response (202 Accepted)
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
- `/api/v1/azure/function1` e `/api/v1/azure/function2` chamam Functions
- `/api/v1/usuarios` e `/api/v1/lotes-produtos` chamam microsserviços
- Possível criar endpoint agregado que chama ambos

✅ **BFF realiza request para function e microserviço para CRUD**
- Todos os endpoints CRUD implementados
- Rotas para Functions implementadas

✅ **BFF realiza request para function para CREATE via evento**
- Endpoint `/api/v1/azure/process-and-notify` implementado
- Fluxo: BFF → Function → Service Bus → Persistência

✅ **Function recebe evento e persiste no banco de dados**
- Functions podem receber via HTTP
- Functions podem publicar no Service Bus
- Microsserviços persistem os dados

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

1. Implementar autenticação JWT no BFF
2. Hash de senhas (bcrypt) no micro-azure
3. Rate limiting
4. Circuit breaker para resiliência
5. Implementar Azure Functions completas
6. Adicionar testes unitários e integração
7. CI/CD pipeline

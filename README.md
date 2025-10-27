# LevaJá - Complete Event-Driven Microservices Architecture

Sistema completo de gerenciamento de usuários e lotes de produtos com arquitetura de microserviços orientada a eventos, implementando o padrão API Gateway (BFF), frontend React, e integração completa com Azure Cloud Services.

## 📋 Índice

- [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
- [Componentes do Sistema](#-componentes-do-sistema)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração para Azure](#-configuração-para-azure)
- [Deployment no Azure](#-deployment-no-azure)
- [Configuração Local](#-configuração-local)
- [Testes](#-testes)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Visão Geral da Arquitetura

```
Frontend (React :5173)
       ↓
BFF (:3000) ─┬─→ micro-azure (:3001) → Azure SQL
             │                    ↓
             │         [Publica Evento no Service Bus]
             │                    ↓
             │              Service Bus (usuario-criado)
             │                    ↓
             │         function-usuarios-auditoria → MongoDB
             │
             ├─→ micro-mongo (:3002) → MongoDB
             │                    ↓
             │         [Publica Evento no Service Bus]
             │                    ↓
             │              Service Bus (lote-criado)
             │                    ↓
             │         function-produtos-auditoria → Azure SQL
             │
             ├─→ Azure Functions (HTTP endpoints para consultas)
             │         ↓
             │    [Endpoints de Agregação]
             │         ↓
             └─→ Dashboard com dados de todas as fontes
```

### Fluxo de Eventos

1. **Criação de Usuário**: Frontend → BFF → micro-azure → Azure SQL + **Service Bus** → function-usuarios-auditoria → MongoDB (auditoria)
2. **Criação de Produto**: Frontend → BFF → micro-mongo → MongoDB + **Service Bus** → function-produtos-auditoria → Azure SQL (auditoria + alertas)
3. **Consulta Agregada**: Frontend → BFF → Agrega dados de microserviços + Azure Functions → Resposta unificada

## 📦 Componentes do Sistema

### 1. **mfe-admin** (Frontend React)
- **Tecnologia**: React 19 + Vite
- **Porta**: 5173
- **Funcionalidades**: CRUD completo de usuários e produtos com interface responsiva

### 2. **micro-bff** (Backend for Frontend - API Gateway)
- **Tecnologia**: Express.js + Node.js 20
- **Porta**: 3000
- **Funcionalidades**: 
  - Proxy e agregação de dados
  - Publicação de eventos no Service Bus
  - Consulta de estatísticas das Functions
  - Segurança (Helmet, CORS, validação)

### 3. **micro-azure** (Microserviço de Usuários)
- **Tecnologia**: Express.js + Node.js 20 + mssql
- **Porta**: 3001
- **Banco de Dados**: Azure SQL Server
- **Funcionalidades**: CRUD de usuários

### 4. **micro-mongo** (Microserviço de Produtos)
- **Tecnologia**: Express.js + Node.js 20 + Mongoose
- **Porta**: 3002
- **Banco de Dados**: MongoDB / Azure Cosmos DB
- **Funcionalidades**: CRUD de lotes de produtos

### 5. **function-usuarios-auditoria** (Azure Function)
- **Tecnologia**: Node.js 20 + Azure Functions Runtime
- **Porta**: 7071 (local)
- **Triggers**: HTTP + Service Bus (fila: usuario-criado)
- **Banco de Dados**: MongoDB
- **Funcionalidades**: Auditoria de usuários + estatísticas

### 6. **function-produtos-auditoria** (Azure Function)
- **Tecnologia**: Node.js 20 + Azure Functions Runtime
- **Porta**: 7072 (local)
- **Triggers**: HTTP + Service Bus (fila: lote-criado)
- **Banco de Dados**: Azure SQL Server
- **Funcionalidades**: Auditoria de produtos + alertas + relatórios

## 🔧 Pré-requisitos

### Para Desenvolvimento Local
- Node.js 20.x ou superior
- Docker Desktop (para containerização)
- Azure Functions Core Tools 4.x
- MongoDB (local ou Cloud)
- Azure SQL Server (ou SQL Server local)

### Para Deployment no Azure
- Conta Azure ativa
- Azure CLI instalado
- Azure Functions Core Tools 4.x
- Docker Desktop
- Azure Container Registry (ou Docker Hub)

## ☁️ Configuração para Azure

### Passo 1: Criar Recursos no Azure

#### 1.1 Azure Resource Group
```bash
az group create --name levaja-rg --location brazilsouth
```

#### 1.2 Azure SQL Server e Database (para micro-azure e function-produtos-auditoria)
```bash
# Criar SQL Server
az sql server create \
  --name levaja-sql-server \
  --resource-group levaja-rg \
  --location brazilsouth \
  --admin-user sqladmin \
  --admin-password 'SuaSenhaForte123!'

# Configurar firewall
az sql server firewall-rule create \
  --resource-group levaja-rg \
  --server levaja-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Criar database para micro-azure
az sql db create \
  --resource-group levaja-rg \
  --server levaja-sql-server \
  --name levaja-usuarios-db \
  --service-objective S0

# Criar database para auditoria (function-produtos-auditoria)
az sql db create \
  --resource-group levaja-rg \
  --server levaja-sql-server \
  --name levaja-audit-db \
  --service-objective S0
```

**Connection Strings:**
- micro-azure: `Server=tcp:levaja-sql-server.database.windows.net,1433;Database=levaja-usuarios-db;User ID=sqladmin;Password=SuaSenhaForte123!;Encrypt=true`
- function-produtos-auditoria: `Server=tcp:levaja-sql-server.database.windows.net,1433;Database=levaja-audit-db;User ID=sqladmin;Password=SuaSenhaForte123!;Encrypt=true`

#### 1.3 Azure Cosmos DB (MongoDB API para micro-mongo e function-usuarios-auditoria)
```bash
# Criar Cosmos DB account
az cosmosdb create \
  --name levaja-cosmos \
  --resource-group levaja-rg \
  --kind MongoDB \
  --server-version 4.2 \
  --default-consistency-level Session

# Criar database para micro-mongo
az cosmosdb mongodb database create \
  --account-name levaja-cosmos \
  --resource-group levaja-rg \
  --name levaja

# Criar database para auditoria
az cosmosdb mongodb database create \
  --account-name levaja-cosmos \
  --resource-group levaja-rg \
  --name levaja-audit

# Obter connection string
az cosmosdb keys list \
  --name levaja-cosmos \
  --resource-group levaja-rg \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv
```

**Connection Strings:**
- micro-mongo: `mongodb://levaja-cosmos:PASSWORD@levaja-cosmos.mongo.cosmos.azure.com:10255/levaja?ssl=true&replicaSet=globaldb`
- function-usuarios-auditoria: `mongodb://levaja-cosmos:PASSWORD@levaja-cosmos.mongo.cosmos.azure.com:10255/levaja-audit?ssl=true&replicaSet=globaldb`

#### 1.4 Azure Service Bus (para eventos)
```bash
# Criar Service Bus namespace
az servicebus namespace create \
  --name levaja-servicebus \
  --resource-group levaja-rg \
  --location brazilsouth \
  --sku Standard

# Criar fila para eventos de usuários
az servicebus queue create \
  --name usuario-criado \
  --namespace-name levaja-servicebus \
  --resource-group levaja-rg

# Criar fila para eventos de produtos
az servicebus queue create \
  --name lote-criado \
  --namespace-name levaja-servicebus \
  --resource-group levaja-rg

# Obter connection string
az servicebus namespace authorization-rule keys list \
  --resource-group levaja-rg \
  --namespace-name levaja-servicebus \
  --name RootManageSharedAccessKey \
  --query primaryConnectionString -o tsv
```

**Connection String:**
```
Endpoint=sb://levaja-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=...
```

#### 1.5 Azure Container Registry
```bash
# Criar Container Registry
az acr create \
  --name levajaacr \
  --resource-group levaja-rg \
  --sku Basic

# Habilitar admin
az acr update --name levajaacr --admin-enabled true

# Obter credenciais
az acr credential show --name levajaacr
```

### Passo 2: Build e Push das Imagens Docker

#### 2.1 Login no ACR
```bash
az acr login --name levajaacr
```

#### 2.2 Build e Push - micro-bff
```bash
cd micro-bff
docker build -t levajaacr.azurecr.io/micro-bff:latest .
docker push levajaacr.azurecr.io/micro-bff:latest
```

#### 2.3 Build e Push - micro-azure
```bash
cd ../micro-azure
docker build -t levajaacr.azurecr.io/micro-azure:latest .
docker push levajaacr.azurecr.io/micro-azure:latest
```

#### 2.4 Build e Push - micro-mongo
```bash
cd ../micro-mongo
docker build -t levajaacr.azurecr.io/micro-mongo:latest .
docker push levajaacr.azurecr.io/micro-mongo:latest
```

## 🚀 Deployment no Azure

### Opção 1: Azure App Service (Recomendado para Produção)

#### Deploy micro-azure
```bash
az webapp create \
  --resource-group levaja-rg \
  --plan levaja-asp \
  --name levaja-micro-azure \
  --deployment-container-image-name levajaacr.azurecr.io/micro-azure:latest

# Configurar variáveis de ambiente
az webapp config appsettings set \
  --resource-group levaja-rg \
  --name levaja-micro-azure \
  --settings \
    AZURE_SQL_SERVER="levaja-sql-server.database.windows.net" \
    AZURE_SQL_DATABASE="levaja-usuarios-db" \
    AZURE_SQL_USER="sqladmin" \
    AZURE_SQL_PASSWORD="SuaSenhaForte123!" \
    PORT="8080"
```

#### Deploy micro-mongo
```bash
az webapp create \
  --resource-group levaja-rg \
  --plan levaja-asp \
  --name levaja-micro-mongo \
  --deployment-container-image-name levajaacr.azurecr.io/micro-mongo:latest

# Configurar variáveis de ambiente
az webapp config appsettings set \
  --resource-group levaja-rg \
  --name levaja-micro-mongo \
  --settings \
    MONGODB_URI="mongodb://levaja-cosmos:...@levaja-cosmos.mongo.cosmos.azure.com:10255/levaja?ssl=true" \
    PORT="8080"
```

#### Deploy micro-bff
```bash
az webapp create \
  --resource-group levaja-rg \
  --plan levaja-asp \
  --name levaja-bff \
  --deployment-container-image-name levajaacr.azurecr.io/micro-bff:latest

# Configurar variáveis de ambiente
az webapp config appsettings set \
  --resource-group levaja-rg \
  --name levaja-bff \
  --settings \
    USER_SERVICE_URL="https://levaja-micro-azure.azurewebsites.net" \
    PRODUCT_SERVICE_URL="https://levaja-micro-mongo.azurewebsites.net" \
    CORS_ORIGIN="https://seu-frontend.azurewebsites.net" \
    AZURE_SERVICE_BUS_CONNECTION_STRING="Endpoint=sb://..." \
    AZURE_SERVICE_BUS_USER_QUEUE="usuario-criado" \
    AZURE_SERVICE_BUS_PRODUCT_QUEUE="lote-criado" \
    AZURE_FUNCTION1_URL="https://levaja-func-usuarios.azurewebsites.net/api" \
    AZURE_FUNCTION2_URL="https://levaja-func-produtos.azurewebsites.net/api" \
    PORT="8080"
```

### Opção 2: Deploy das Azure Functions

#### Deploy function-usuarios-auditoria
```bash
cd function-usuarios-auditoria

# Criar Function App
az functionapp create \
  --resource-group levaja-rg \
  --name levaja-func-usuarios \
  --storage-account levajastrg \
  --consumption-plan-location brazilsouth \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4

# Configurar variáveis
az functionapp config appsettings set \
  --name levaja-func-usuarios \
  --resource-group levaja-rg \
  --settings \
    MONGODB_URI="mongodb://..." \
    AZURE_SERVICE_BUS_CONNECTION_STRING="Endpoint=sb://..."

# Deploy
func azure functionapp publish levaja-func-usuarios
```

#### Deploy function-produtos-auditoria
```bash
cd ../function-produtos-auditoria

# Criar Function App
az functionapp create \
  --resource-group levaja-rg \
  --name levaja-func-produtos \
  --storage-account levajastrg \
  --consumption-plan-location brazilsouth \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4

# Configurar variáveis
az functionapp config appsettings set \
  --name levaja-func-produtos \
  --resource-group levaja-rg \
  --settings \
    AZURE_SQL_SERVER="levaja-sql-server.database.windows.net" \
    AZURE_SQL_DATABASE="levaja-audit-db" \
    AZURE_SQL_USER="sqladmin" \
    AZURE_SQL_PASSWORD="SuaSenhaForte123!" \
    AZURE_SERVICE_BUS_CONNECTION_STRING="Endpoint=sb://..."

# Deploy
func azure functionapp publish levaja-func-produtos
```

### Opção 3: Deploy do Frontend (Azure Static Web Apps)

```bash
cd mfe-admin

# Build de produção
npm run build

# Criar Static Web App
az staticwebapp create \
  --name levaja-frontend \
  --resource-group levaja-rg \
  --source dist/ \
  --location brazilsouth \
  --branch main \
  --app-location "/" \
  --output-location "dist"

# Configurar variável de ambiente
# Editar .env.production:
VITE_API_URL=https://levaja-bff.azurewebsites.net/api/v1
```

**Importante:** O frontend requer **Node.js v20 ou superior**. O arquivo `.nvmrc` está incluído no projeto para garantir que o Azure Static Web Apps use a versão correta durante o build.

Se encontrar erros relacionados ao Node.js durante o deploy (ex: "EBADENGINE Unsupported engine"), verifique que:
1. O arquivo `.nvmrc` contém `20`
2. O `package.json` tem o campo `engines` especificando Node >=20.0.0
3. A configuração do Azure Static Web Apps está usando o Node.js 20

Para forçar a versão do Node no Azure Static Web Apps, adicione no arquivo de configuração `.github/workflows` (se usando GitHub Actions):
```yaml
env:
  NODE_VERSION: '20'
```

## 💻 Configuração Local

### 1. Pré-requisitos Locais
```bash
# Instalar Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Iniciar MongoDB local (Docker)
docker run -d -p 27017:27017 --name mongo mongo:latest

# Iniciar SQL Server local (Docker) - Opcional
docker run -d -p 1433:1433 --name sqlserver \
  -e 'ACCEPT_EULA=Y' \
  -e 'SA_PASSWORD=SuaSenhaForte123!' \
  mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Configurar Service Bus Local (Azurite ou usar Azure diretamente)
Para desenvolvimento local, recomenda-se usar Azure Service Bus real (tier básico é econômico).

### 3. Iniciar Microserviços

#### micro-azure
```bash
cd micro-azure
npm install
cp .env.example .env
# Editar .env com suas configurações
npm start
# Rodando em http://localhost:3001
```

#### micro-mongo
```bash
cd micro-mongo
npm install
cp .env.example .env
# Editar .env com suas configurações
npm start
# Rodando em http://localhost:3002
```

#### micro-bff
```bash
cd micro-bff
npm install
cp .env.example .env
# Editar .env com URLs dos microserviços e Azure
npm start
# Rodando em http://localhost:3000
```

### 4. Iniciar Azure Functions

#### function-usuarios-auditoria
```bash
cd function-usuarios-auditoria
npm install
cp local.settings.example.json local.settings.json
# Editar local.settings.json
func start --port 7071
# Rodando em http://localhost:7071
```

#### function-produtos-auditoria
```bash
cd function-produtos-auditoria
npm install
cp local.settings.example.json local.settings.json
# Editar local.settings.json
func start --port 7072
# Rodando em http://localhost:7072
```

### 5. Iniciar Frontend
```bash
cd mfe-admin
npm install
cp .env.example .env
# Configurar VITE_API_URL=http://localhost:3000/api/v1
npm run dev
# Rodando em http://localhost:5173
```

**Nota:** O frontend requer Node.js v20 ou superior. O arquivo `.nvmrc` está configurado para garantir compatibilidade.

## ✅ Testes

### Testar Health Checks
```bash
# micro-azure
curl http://localhost:3001/health

# micro-mongo
curl http://localhost:3002/health

# micro-bff
curl http://localhost:3000/api/v1/health

# Functions
curl http://localhost:7071/api/statistics
curl http://localhost:7072/api/produtos-auditoria
```

### Testar Fluxo Completo

#### 1. Criar Usuário
```bash
curl -X POST http://localhost:3000/api/v1/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "senha": "senha123"
  }'
```

#### 2. Verificar Evento Processado (aguardar alguns segundos)
```bash
curl http://localhost:7071/api/usuarios-auditoria
```

#### 3. Criar Produto
```bash
curl -X POST http://localhost:3000/api/v1/lotes-produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Arroz Integral 1kg",
    "categoria": "Alimentos",
    "estoque": 45,
    "valor": 15.99,
    "validade": "2025-12-31"
  }'
```

#### 4. Verificar Alertas (estoque baixo)
```bash
curl http://localhost:7072/api/relatorios/estoque-baixo
```

#### 5. Consultar Dashboard Agregado
```bash
curl http://localhost:3000/api/v1/agregacao/dashboard
```

## 🐛 Troubleshooting

### Problema: Frontend deployment falha com erro "EBADENGINE Unsupported engine"
**Causa**: Azure Static Web Apps está usando Node.js v18, mas o projeto requer v20+

**Solução**: 
1. Verificar que o arquivo `.nvmrc` existe em `mfe-admin/` com conteúdo `20`
2. Verificar que `package.json` tem o campo `engines` especificando Node >=20.0.0
3. Se usando GitHub Actions, adicionar ao workflow:
```yaml
env:
  NODE_VERSION: '20'
```
4. Limpar cache do Azure e refazer deploy
```bash
# Deletar e recriar Static Web App
az staticwebapp delete --name levaja-frontend --resource-group levaja-rg
# Recriar com configuração correta
```

### Problema: Containers não iniciam no Azure
**Solução**: Verificar logs do container
```bash
az webapp log tail --name levaja-micro-azure --resource-group levaja-rg
```

### Problema: Service Bus não recebe eventos
**Solução**: Verificar connection string e permissões
```bash
# Testar envio direto
curl -X POST http://localhost:3000/api/v1/azure/send-message \
  -H "Content-Type: application/json" \
  -d '{"message": "teste"}'
```

### Problema: Azure Functions não disparam com Service Bus
**Solução**: 
1. Verificar se a fila existe
2. Verificar connection string nas configurações
3. Verificar logs da Function
```bash
func azure functionapp logstream levaja-func-usuarios
```

### Problema: CORS errors no frontend
**Solução**: Adicionar origem do frontend no .env do BFF
```env
CORS_ORIGIN=https://seu-frontend.azurewebsites.net,http://localhost:5173
```

### Problema: Connection timeout para SQL Server
**Solução**: Verificar regras de firewall
```bash
az sql server firewall-rule create \
  --resource-group levaja-rg \
  --server levaja-sql-server \
  --name AllowMyIP \
  --start-ip-address SEU_IP \
  --end-ip-address SEU_IP
```

## 📊 Monitoramento

### Application Insights
```bash
# Habilitar Application Insights para todos os serviços
az monitor app-insights component create \
  --app levaja-insights \
  --location brazilsouth \
  --resource-group levaja-rg

# Configurar nos serviços
az webapp config appsettings set \
  --name levaja-bff \
  --resource-group levaja-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="sua-key"
```

## 💰 Estimativa de Custos (Azure)

### Tier Básico (Desenvolvimento/Teste)
- **App Service Plan (B1)**: ~R$ 60/mês (3 containers)
- **Azure SQL (S0)**: ~R$ 30/mês × 2 = R$ 60/mês
- **Cosmos DB (400 RU/s)**: ~R$ 60/mês
- **Service Bus (Basic)**: ~R$ 2/mês
- **Functions (Consumption)**: ~R$ 0 (free tier)
- **Container Registry**: ~R$ 20/mês
- **Total**: ~R$ 200-250/mês

### Tier Produção (Escalável)
- **App Service Plan (P1V2)**: ~R$ 280/mês
- **Azure SQL (S2)**: ~R$ 180/mês × 2 = R$ 360/mês
- **Cosmos DB (1000 RU/s)**: ~R$ 150/mês
- **Service Bus (Standard)**: ~R$ 40/mês
- **Functions (Premium)**: ~R$ 350/mês
- **Application Insights**: ~R$ 50/mês
- **Total**: ~R$ 1200-1500/mês

## 📝 Variáveis de Ambiente - Resumo

### micro-bff
```env
PORT=3000
NODE_ENV=production
USER_SERVICE_URL=https://levaja-micro-azure.azurewebsites.net
PRODUCT_SERVICE_URL=https://levaja-micro-mongo.azurewebsites.net
CORS_ORIGIN=https://seu-frontend.azurewebsites.net
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://...
AZURE_SERVICE_BUS_USER_QUEUE=usuario-criado
AZURE_SERVICE_BUS_PRODUCT_QUEUE=lote-criado
AZURE_FUNCTION1_URL=https://levaja-func-usuarios.azurewebsites.net/api
AZURE_FUNCTION2_URL=https://levaja-func-produtos.azurewebsites.net/api
```

### micro-azure
```env
PORT=3001
NODE_ENV=production
AZURE_SQL_SERVER=levaja-sql-server.database.windows.net
AZURE_SQL_DATABASE=levaja-usuarios-db
AZURE_SQL_USER=sqladmin
AZURE_SQL_PASSWORD=SuaSenhaForte123!
```

### micro-mongo
```env
PORT=3002
NODE_ENV=production
MONGODB_URI=mongodb://levaja-cosmos:...@levaja-cosmos.mongo.cosmos.azure.com:10255/levaja?ssl=true
```

### function-usuarios-auditoria
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "mongodb://...",
    "AZURE_SERVICE_BUS_CONNECTION_STRING": "Endpoint=sb://..."
  }
}
```

### function-produtos-auditoria
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_SQL_SERVER": "levaja-sql-server.database.windows.net",
    "AZURE_SQL_DATABASE": "levaja-audit-db",
    "AZURE_SQL_USER": "sqladmin",
    "AZURE_SQL_PASSWORD": "SuaSenhaForte123!",
    "AZURE_SERVICE_BUS_CONNECTION_STRING": "Endpoint=sb://..."
  }
}
```

## 📚 Documentação Adicional

- **ARCHITECTURE.md**: Arquitetura completa do sistema
- **micro-bff/AZURE_DEPLOY.md**: Guia detalhado de deploy do BFF
- **micro-bff/AZURE_INTEGRATION.md**: Integração com Azure Services
- **micro-bff/SECURITY.md**: Considerações de segurança
- **function-usuarios-auditoria/README.md**: Documentação da Function de usuários
- **function-produtos-auditoria/README.md**: Documentação da Function de produtos

## 🤝 Suporte

Para problemas ou dúvidas, consulte a documentação específica de cada componente ou abra uma issue no repositório.

## 📄 Licença

[Incluir licença do projeto]

---

**Desenvolvido com ❤️ para o projeto LevaJá**

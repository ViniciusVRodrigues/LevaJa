# Function 1: Auditoria de Usuários

Azure Function para auditoria de criação de usuários com MongoDB.

## Funcionalidades

### HTTP Triggers - Endpoints de Consulta

1. **GET /api/usuarios-auditoria**
   - Lista todos os logs de auditoria de criação de usuários
   - Suporta paginação (`?page=1&limit=20`)
   - Ordenado por timestamp decrescente

2. **GET /api/usuarios-auditoria/:id**
   - Busca auditoria específica por ID
   - Retorna 404 se não encontrado

3. **GET /api/statistics**
   - Retorna estatísticas agregadas:
     - Total de usuários criados via eventos
     - Usuários criados hoje
     - Última data de processamento
     - Usuários criados por dia (últimos 7 dias)

### Service Bus Trigger - Consumidor de Eventos

**Fila:** `usuario-criado`

**Estrutura do Evento:**
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

**Ações:**
- Extrai dados do evento (id, nome, email, timestamp)
- Registra em tabela `usuarios_auditoria` no MongoDB
- Calcula métricas (total de usuários criados hoje)
- Persiste log completo do evento
- Atualiza coleção de métricas

## Configuração

### Variáveis de Ambiente

Crie um arquivo `local.settings.json` baseado em `local.settings.example.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "mongodb://localhost:27017/auditoria",
    "SERVICE_BUS_CONNECTION": "Endpoint=sb://your-servicebus.servicebus.windows.net/..."
  }
}
```

### Instalação

```bash
npm install
```

### Execução Local

```bash
npm start
# ou
func start
```

## Estrutura do Banco de Dados (MongoDB)

### Coleção: usuarios_auditoria

```javascript
{
  "_id": ObjectId("..."),
  "eventType": "UsuarioCriado",
  "timestamp": "2025-10-26T20:00:00Z",
  "usuarioId": "507f1f77bcf86cd799439011",
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "processedAt": "2025-10-26T20:00:05Z",
  "originalEvent": { /* evento completo */ }
}
```

### Coleção: metricas

```javascript
{
  "_id": ObjectId("..."),
  "data": "2025-10-26",
  "totalUsuariosCriados": 15,
  "ultimaAtualizacao": "2025-10-26T20:00:05Z"
}
```

## Testando os Endpoints

```bash
# Listar auditorias
curl http://localhost:7071/api/usuarios-auditoria

# Buscar auditoria específica
curl http://localhost:7071/api/usuarios-auditoria/{id}

# Ver estatísticas
curl http://localhost:7071/api/statistics
```

## Deploy no Azure

```bash
# Login no Azure
az login

# Criar Function App
az functionapp create \
  --resource-group seu-resource-group \
  --consumption-plan-location brazilsouth \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --name function-usuarios-auditoria \
  --storage-account seustorage

# Configurar variáveis de ambiente
az functionapp config appsettings set \
  --name function-usuarios-auditoria \
  --resource-group seu-resource-group \
  --settings \
  MONGODB_URI="mongodb://..." \
  SERVICE_BUS_CONNECTION="Endpoint=sb://..."

# Deploy
func azure functionapp publish function-usuarios-auditoria
```

## Integração com o Sistema

Esta function é chamada pelo BFF através de:
- HTTP: Para consultas de auditoria e estatísticas
- Service Bus: Para processar eventos de criação de usuários

O micro-azure envia eventos para a fila `usuario-criado` sempre que um novo usuário é criado.

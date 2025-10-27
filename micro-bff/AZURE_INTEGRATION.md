# Integração com Azure Functions e Service Bus

Este documento descreve como o BFF se integra com Azure Functions e Azure Service Bus.

## Visão Geral

O BFF implementa integração simplificada com:
- **Azure Functions (HTTP)**: Chamadas HTTP para 2 Azure Functions
- **Azure Service Bus**: Envio de mensagens para filas

## Azure Functions

### Configuração

Configure as URLs e chaves das Azure Functions no `.env`:

```env
# Azure Function 1 - Exemplo: processamento de dados
AZURE_FUNCTION1_URL=https://your-function-app.azurewebsites.net/api/function1
AZURE_FUNCTION1_KEY=your-function1-key

# Azure Function 2 - Exemplo: notificações
AZURE_FUNCTION2_URL=https://your-function-app.azurewebsites.net/api/function2
AZURE_FUNCTION2_KEY=your-function2-key

# Timeout (opcional)
AZURE_FUNCTION_TIMEOUT=10000
```

### Endpoints Disponíveis

#### 1. Chamar Function 1
```bash
POST /api/v1/azure/function1
Content-Type: application/json

{
  "data": "seus dados aqui"
}
```

#### 2. Chamar Function 2
```bash
POST /api/v1/azure/function2
Content-Type: application/json

{
  "notification": "sua notificação"
}
```

### Exemplo de Uso

```javascript
// Via curl
curl -X POST http://localhost:3000/api/v1/azure/function1 \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "action": "process"}'

// Via JavaScript/Axios
const response = await axios.post('/api/v1/azure/function1', {
  userId: '123',
  action: 'process'
});
```

## Azure Service Bus

### Configuração

Configure a connection string e nome da fila no `.env`:

```env
# Connection String (obtenha no Azure Portal)
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=your-key

# Nome da fila
AZURE_SERVICE_BUS_QUEUE_NAME=default-queue
```

### Como obter a Connection String

1. Acesse o Azure Portal
2. Navegue até seu Service Bus Namespace
3. Vá em "Shared access policies"
4. Copie a "Primary Connection String"

### Endpoints Disponíveis

#### 1. Enviar Mensagem Única
```bash
POST /api/v1/azure/send-message
Content-Type: application/json

{
  "message": {
    "type": "user.created",
    "userId": "123",
    "timestamp": "2025-10-26T12:00:00Z"
  }
}
```

#### 2. Enviar Mensagens em Lote
```bash
POST /api/v1/azure/send-batch
Content-Type: application/json

{
  "messages": [
    {"type": "event1", "data": "..."},
    {"type": "event2", "data": "..."}
  ]
}
```

### Exemplo de Uso

```javascript
// Enviar mensagem única
const response = await axios.post('/api/v1/azure/send-message', {
  message: {
    type: 'user.created',
    userId: '123',
    email: 'user@example.com'
  }
});

// Enviar múltiplas mensagens
const response = await axios.post('/api/v1/azure/send-batch', {
  messages: [
    { type: 'order.created', orderId: '1' },
    { type: 'order.created', orderId: '2' }
  ]
});
```

## Fluxo Combinado

### Processar e Notificar

Endpoint que combina Azure Function + Service Bus:

```bash
POST /api/v1/azure/process-and-notify
Content-Type: application/json

{
  "data": "dados para processar"
}
```

Este endpoint:
1. Envia dados para Azure Function 1
2. Recebe o resultado processado
3. Envia o resultado para o Service Bus
4. Retorna a resposta

## Casos de Uso

### 1. Processamento Assíncrono
```javascript
// Envia dados para processamento via Function
await axios.post('/api/v1/azure/function1', {
  operation: 'heavy-computation',
  data: largeDataset
});
```

### 2. Notificações
```javascript
// Envia notificação via Function
await axios.post('/api/v1/azure/function2', {
  type: 'email',
  to: 'user@example.com',
  subject: 'Welcome'
});
```

### 3. Event Sourcing
```javascript
// Registra evento no Service Bus
await axios.post('/api/v1/azure/send-message', {
  message: {
    eventType: 'user.registered',
    userId: newUser.id,
    timestamp: new Date().toISOString()
  }
});
```

### 4. Integração Completa
```javascript
// Processa dados e notifica via mensageria
await axios.post('/api/v1/azure/process-and-notify', {
  userId: '123',
  action: 'update-profile'
});
```

## Tratamento de Erros

O BFF trata erros de forma graceful:

```javascript
{
  "success": false,
  "message": "Service Bus not configured",
  // ou
  "error": "Failed to call Azure Function"
}
```

Se as configurações não estiverem presentes, o BFF:
- Loga um warning
- Retorna resposta indicando que o serviço não está configurado
- Não bloqueia a inicialização do servidor

## Monitoramento

### Logs

O BFF loga todas as operações:

```
Azure Service Bus initialized successfully
Message sent to Service Bus: {...}
Azure Function Error: timeout of 10000ms exceeded
```

### Health Check

O health check não verifica Azure services (são opcionais):

```bash
GET /api/v1/health

{
  "status": "ok",
  "timestamp": "2025-10-26T12:00:00Z",
  "uptime": 123.45,
  "service": "BFF API Gateway"
}
```

## Segurança

### Function Keys

As Function Keys são enviadas no header:
```
x-functions-key: your-function-key
```

### Service Bus

A autenticação usa a Connection String que contém:
- SharedAccessKeyName
- SharedAccessKey

Nunca commite essas credenciais no código!

## Deploy no Azure

### Variáveis de Ambiente

Configure no Azure App Service:

```bash
az webapp config appsettings set \
  --resource-group levaja-rg \
  --name levaja-bff \
  --settings \
    AZURE_FUNCTION1_URL="https://..." \
    AZURE_FUNCTION1_KEY="..." \
    AZURE_FUNCTION2_URL="https://..." \
    AZURE_FUNCTION2_KEY="..." \
    AZURE_SERVICE_BUS_CONNECTION_STRING="Endpoint=..." \
    AZURE_SERVICE_BUS_QUEUE_NAME="default-queue"
```

## Desenvolvimento Local

### Sem Azure

O BFF funciona normalmente sem as configurações Azure:
- Functions: retornam `{ success: false, message: 'not configured' }`
- Service Bus: retorna `{ success: false, message: 'not configured' }`

### Com Azure Local (Azurite)

Para desenvolvimento, use [Azurite](https://github.com/Azure/Azurite):

```bash
npm install -g azurite
azurite --location ./azurite-data
```

## Troubleshooting

### Connection String Inválida
```
Error initializing Service Bus: Invalid connection string
```
Verifique o formato da connection string.

### Function Timeout
```
Azure Function Error: timeout of 10000ms exceeded
```
Aumente `AZURE_FUNCTION_TIMEOUT` no `.env`.

### Fila Não Existe
```
Error: The messaging entity 'queue-name' could not be found
```
Crie a fila no Azure Portal ou via CLI.

## Referências

- [Azure Functions HTTP Triggers](https://learn.microsoft.com/azure/azure-functions/functions-bindings-http-webhook-trigger)
- [Azure Service Bus Client](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-nodejs-how-to-use-queues)
- [SDK @azure/service-bus](https://www.npmjs.com/package/@azure/service-bus)

# Function 2: Auditoria de Produtos

Azure Function para auditoria de criação de lotes de produtos com Azure SQL Server.

## Funcionalidades

### HTTP Triggers - Endpoints de Consulta

1. **GET /api/produtos-auditoria**
   - Lista todos os logs de auditoria de criação de lotes
   - Suporta paginação (`?page=1&limit=20`)
   - Ordenado por timestamp decrescente

2. **GET /api/produtos-auditoria/:id**
   - Busca auditoria específica por ID
   - Retorna 404 se não encontrado

3. **GET /api/relatorios/estoque-baixo**
   - Relatório de produtos com estoque abaixo de X unidades
   - Query param: `?limite=50` (default: 50)
   - Retorna produtos e alertas de estoque baixo

4. **GET /api/relatorios/vencimentos-proximos**
   - Relatório de lotes próximos da validade
   - Query param: `?dias=30` (default: 30)
   - Retorna produtos próximos do vencimento, vencidos, e alertas

### Service Bus Trigger - Consumidor de Eventos

**Fila:** `lote-criado`

**Estrutura do Evento:**
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

**Ações:**
- Extrai dados do evento (id, nome, categoria, estoque, validade, valor)
- Registra em tabela `produtos_auditoria` no Azure SQL
- Verifica se estoque está baixo (≤50 unidades) e registra alerta
- Verifica se validade está próxima (≤30 dias) e registra alerta
- Persiste log completo do evento

## Configuração

### Variáveis de Ambiente

Crie um arquivo `local.settings.json` baseado em `local.settings.example.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_SQL_SERVER": "your-server.database.windows.net",
    "AZURE_SQL_DATABASE": "auditoria",
    "AZURE_SQL_USER": "sqladmin",
    "AZURE_SQL_PASSWORD": "your-password",
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

## Estrutura do Banco de Dados (Azure SQL)

### Tabela: produtos_auditoria

```sql
CREATE TABLE produtos_auditoria (
  id INT IDENTITY(1,1) PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  timestamp DATETIME2 NOT NULL,
  lote_id VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  estoque INT,
  validade DATE,
  valor DECIMAL(10,2),
  processed_at DATETIME2 DEFAULT GETDATE(),
  original_event NVARCHAR(MAX),
  INDEX idx_timestamp (timestamp DESC),
  INDEX idx_lote_id (lote_id)
)
```

### Tabela: alertas

```sql
CREATE TABLE alertas (
  id INT IDENTITY(1,1) PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,  -- 'ESTOQUE_BAIXO' ou 'VENCIMENTO_PROXIMO'
  lote_id VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  mensagem NVARCHAR(500),
  created_at DATETIME2 DEFAULT GETDATE(),
  INDEX idx_tipo (tipo),
  INDEX idx_created_at (created_at DESC)
)
```

## Testando os Endpoints

```bash
# Listar auditorias
curl http://localhost:7071/api/produtos-auditoria

# Buscar auditoria específica
curl http://localhost:7071/api/produtos-auditoria/1

# Relatório de estoque baixo (limite de 50 unidades)
curl http://localhost:7071/api/relatorios/estoque-baixo?limite=50

# Relatório de vencimentos próximos (30 dias)
curl http://localhost:7071/api/relatorios/vencimentos-proximos?dias=30
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
  --name function-produtos-auditoria \
  --storage-account seustorage

# Configurar variáveis de ambiente
az functionapp config appsettings set \
  --name function-produtos-auditoria \
  --resource-group seu-resource-group \
  --settings \
  AZURE_SQL_SERVER="your-server.database.windows.net" \
  AZURE_SQL_DATABASE="auditoria" \
  AZURE_SQL_USER="sqladmin" \
  AZURE_SQL_PASSWORD="your-password" \
  SERVICE_BUS_CONNECTION="Endpoint=sb://..."

# Deploy
func azure functionapp publish function-produtos-auditoria
```

## Integração com o Sistema

Esta function é chamada pelo BFF através de:
- HTTP: Para consultas de auditoria e relatórios
- Service Bus: Para processar eventos de criação de lotes

O micro-mongo envia eventos para a fila `lote-criado` sempre que um novo lote é criado.

## Alertas Automáticos

### Estoque Baixo
- Threshold: ≤ 50 unidades
- Cria alerta automaticamente na tabela `alertas`
- Tipo: `ESTOQUE_BAIXO`

### Vencimento Próximo
- Threshold: ≤ 30 dias
- Cria alerta automaticamente na tabela `alertas`
- Tipo: `VENCIMENTO_PROXIMO`
- Ignora produtos já vencidos (dias < 0)

## Relatórios Disponíveis

1. **Estoque Baixo**: Lista produtos com estoque crítico
2. **Vencimentos Próximos**: Lista produtos próximos do vencimento
3. **Produtos Vencidos**: Incluído no relatório de vencimentos

Todos os relatórios incluem alertas relacionados e informações detalhadas dos produtos.

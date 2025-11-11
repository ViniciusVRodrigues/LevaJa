# Microserviço de Usuários - Azure SQL

Microserviço responsável pelo gerenciamento de usuários utilizando Azure SQL Server.

## Funcionalidades

- CRUD completo de usuários
- Conexão com Azure SQL Server
- Paginação de resultados
- Validação de dados
- API REST compatível com o BFF

## Tecnologias

- **Node.js** com Express
- **Azure SQL Server** (mssql)
- **Helmet** para segurança
- **CORS** configurável
- **Morgan** para logging

## Instalação

```bash
npm install
```

## Configuração

Copie o `.env.example` para `.env` e configure:

```env
PORT=3001
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=levaja-users
AZURE_SQL_USER=sqladmin
AZURE_SQL_PASSWORD=YourStrongPassword123!
AZURE_SQL_ENCRYPT=true

# Configurações de Reconexão Azure SQL
# Tempo de espera sugerido ao usuário quando o banco está reconectando (em segundos)
AZURE_SQL_RECONNECT_RETRY_SECONDS=15
# Timeout para requisições (em milissegundos) - deve ser maior que o tempo de reconexão
REQUEST_TIMEOUT=15000

CORS_ORIGIN=http://localhost:3000
```

### Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3001)
- `AZURE_SQL_SERVER`: Endereço do servidor Azure SQL
- `AZURE_SQL_DATABASE`: Nome do banco de dados
- `AZURE_SQL_USER`: Usuário do banco
- `AZURE_SQL_PASSWORD`: Senha do banco
- `AZURE_SQL_ENCRYPT`: Habilita SSL/TLS (padrão: true)
- `AZURE_SQL_RECONNECT_RETRY_SECONDS`: Tempo sugerido para retry quando reconectando (padrão: 15s)
- `REQUEST_TIMEOUT`: Timeout para operações de banco em milissegundos (padrão: 15000ms)
- `CORS_ORIGIN`: Origem permitida para CORS

### Azure SQL Server

1. Crie um Azure SQL Server no portal Azure
2. Crie um banco de dados chamado `levaja-users`
3. Configure firewall para permitir conexões
4. Obtenha as credenciais de conexão

## Reconexão Automática do Azure SQL

Este microserviço implementa reconexão automática quando o Azure SQL desconecta por inatividade. 

### Como Funciona

1. **Lazy Connection**: Conexão é estabelecida sob demanda (não no startup)
2. **Auto-Reconnect**: Detecta desconexões e reconecta automaticamente
3. **Retry Logic**: Tenta reconectar até 3 vezes com backoff exponencial
4. **User-Friendly Errors**: Retorna erro especial durante reconexão

### Erro de Reconexão

Quando o banco está reconectando e não consegue completar no tempo limite, retorna:

```json
{
  "error": "AZURE_SQL_RECONNECTING",
  "retryIn": 15,
  "message": "O banco de dados está reconectando, tente novamente em alguns instantes."
}
```

Status HTTP: `503 Service Unavailable`

Este erro é capturado pelo BFF e frontend, exibindo uma mensagem amigável ao usuário.

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Endpoints

### Health Check
```
GET /health
```

### Usuários

#### Listar usuários (paginado)
```
GET /usuarios?limit=10&offset=0
```

#### Buscar usuário por ID
```
GET /usuarios/:id
```

#### Criar usuário
```
POST /usuarios
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123"
}
```

#### Atualizar usuário
```
PUT /usuarios/:id
Content-Type: application/json

{
  "nome": "João Silva Updated",
  "email": "joao.updated@example.com"
}
```

#### Deletar usuário
```
DELETE /usuarios/:id
```

## Docker

### Build
```bash
docker build -t micro-azure .
```

### Run
```bash
docker run -p 3001:3001 \
  -e AZURE_SQL_SERVER=your-server.database.windows.net \
  -e AZURE_SQL_DATABASE=levaja-users \
  -e AZURE_SQL_USER=sqladmin \
  -e AZURE_SQL_PASSWORD=YourPassword \
  micro-azure
```

## Banco de Dados

A tabela `usuarios` é criada automaticamente na inicialização:

```sql
CREATE TABLE usuarios (
  id INT IDENTITY(1,1) PRIMARY KEY,
  nome NVARCHAR(100) NOT NULL,
  email NVARCHAR(255) NOT NULL UNIQUE,
  senha NVARCHAR(255) NOT NULL,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

## Integração com BFF

O BFF se comunica com este microserviço via HTTP:

```javascript
// No BFF
const response = await axios.get('http://localhost:3001/usuarios');
```

Configure `USER_SERVICE_URL` no BFF para apontar para este microserviço.

## Segurança

- ⚠️ **Importante**: Em produção, implemente hash de senha (bcrypt)
- ⚠️ Configure firewall do Azure SQL corretamente
- ⚠️ Use conexões SSL/TLS (AZURE_SQL_ENCRYPT=true)
- ⚠️ Implemente autenticação JWT no BFF

## Troubleshooting

### Erro de Conexão
```
Error: Failed to connect to Azure SQL
```
- Verifique credenciais
- Confirme que o firewall permite sua IP
- Teste conexão usando Azure Data Studio

### Timeout
```
Error: Request timeout
```
- Aumente timeout na configuração (`REQUEST_TIMEOUT` no .env)
- Verifique rede/firewall
- Verifique se o Azure SQL está ativo

### Reconexão do Azure SQL

Se você ver logs como:
```
🔄 Pool não disponível. Conectando...
🔄 Conectando ao Azure SQL Server... (tentativa 1/4)
```

Isso é normal. O Azure SQL desconecta automaticamente após inatividade. O microserviço irá:
1. Detectar a desconexão
2. Tentar reconectar automaticamente
3. Se demorar mais que o timeout, retornar erro `AZURE_SQL_RECONNECTING` para o cliente
4. O frontend exibirá mensagem amigável com sugestão de retry

**Configurações recomendadas para ambientes de produção:**
- `REQUEST_TIMEOUT=15000` (15 segundos)
- `AZURE_SQL_RECONNECT_RETRY_SECONDS=15`

**Para desenvolvimento/teste:**
- Mantenha os valores padrão
- Se necessário, aumente o timeout para evitar erros durante debug

## Deploy no Azure

Este microserviço pode ser deployado em:
- Azure App Service
- Azure Container Instances
- Azure Kubernetes Service

Ver `../micro-bff/AZURE_DEPLOY.md` para guia completo.

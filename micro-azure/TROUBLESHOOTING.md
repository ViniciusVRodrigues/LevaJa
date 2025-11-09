# Guia de Troubleshooting - Desconexão Azure SQL

Este documento explica como resolver problemas de desconexão do microserviço `micro-azure` com o Azure SQL Database.

## Problema

O microserviço desconecta do Azure SQL Database por inatividade e precisa ser reiniciado manualmente.

## Soluções Implementadas

### 1. Auto-Reconexão Inteligente

**Arquivo**: `micro-azure/db/connection.js`

**Melhorias**:
- ✅ Detecção de desconexão antes de cada query
- ✅ Teste de saúde da conexão (`SELECT 1`)
- ✅ Reconexão automática quando necessário
- ✅ Proteção contra múltiplas tentativas simultâneas
- ✅ Intervalo mínimo entre reconexões (5 segundos)
- ✅ Fechamento adequado de pools antigos antes de reconectar

### 2. Keep-Alive Automático

**Funcionalidade**: Query periódica para manter conexão ativa

```javascript
// Executa SELECT 1 a cada 4 minutos
setInterval(() => {
  pool.request().query('SELECT 1 AS keepalive');
}, 4 * 60 * 1000);
```

**Benefícios**:
- Previne timeout por inatividade
- Mantém pool aquecido
- Detecta desconexões proativamente

### 3. Configurações Otimizadas do Pool

**Arquivo**: `micro-azure/config/index.js`

**Configurações**:
```javascript
pool: {
  max: 10,                          // Máximo de conexões
  min: 2,                           // Mínimo de conexões (mantém pool aquecido)
  idleTimeoutMillis: 300000,        // 5 minutos (antes: 30s)
  acquireTimeoutMillis: 30000,      // Timeout para adquirir conexão
  createTimeoutMillis: 30000,       // Timeout para criar conexão
  destroyTimeoutMillis: 5000,       // Timeout para destruir conexão
  reapIntervalMillis: 1000,         // Verifica conexões idle
  createRetryIntervalMillis: 200    // Intervalo entre retries
}
```

### 4. Timeouts Aumentados

```javascript
options: {
  connectTimeout: 30000,  // 30 segundos
  requestTimeout: 30000,  // 30 segundos
  enableArithAbort: true
}
```

## Configurações Adicionais do Azure

### No Portal Azure

1. **Ir para Azure SQL Database > Configurações**

2. **Firewall e redes virtuais**:
   - Adicione o IP do App Service em "Regras de firewall"
   - Ou habilite "Permitir serviços do Azure"

3. **Connection Policy**:
   - Vá para "Connection policy"
   - Selecione "Redirect" para melhor performance
   - Ou mantenha "Proxy" se houver problemas de rede

4. **Compute + storage**:
   - Verifique se não está em tier "Serverless"
   - Se for Serverless, configure:
     - **Auto-pause delay**: Desabilitar ou aumentar para máximo
     - **Min vCores**: Aumentar para 1 ou 2

### Configuração do App Service

1. **Configurações de Aplicativo**:
   ```
   WEBSITE_TIME_ZONE=E. South America Standard Time
   WEBSITES_ENABLE_APP_SERVICE_STORAGE=true
   ```

2. **Always On** (Plano Standard ou superior):
   - Vá para "Configuração" > "Configurações gerais"
   - Habilite "Always On" = On
   - Isso previne que o App Service durma por inatividade

3. **Health check**:
   - Configure em "Health check"
   - Path: `/health` ou `/api/health`
   - Isso mantém o app acordado

## Verificação e Monitoramento

### Logs em Tempo Real

```bash
# Azure CLI
az webapp log tail --name seu-app-name --resource-group seu-rg

# Ver logs específicos
az webapp log download --name seu-app-name --resource-group seu-rg
```

### Mensagens de Log Esperadas

✅ **Conexão Saudável**:
```
✓ Conectado ao Azure SQL Server
✓ Tabela usuarios verificada/criada
💓 Keep-alive: conexão mantida
```

⚠️ **Reconexão**:
```
🔄 Pool desconectado. Reconectando...
✓ Conectado ao Azure SQL Server
```

❌ **Erro**:
```
❌ Erro ao conectar ao Azure SQL: ...
⚠️ Erro na conexão do pool: ...
```

## Testes Manuais

### 1. Teste de Conexão

```bash
curl https://seu-app.azurewebsites.net/api/usuarios
```

### 2. Teste de Reconexão

1. Espere 10 minutos sem fazer requests
2. Faça um novo request
3. Verifique os logs - deve reconectar automaticamente

### 3. Health Check

Adicione endpoint de health no `index.js`:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: pool && pool.connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});
```

## Troubleshooting por Cenário

### Cenário 1: "Connection Timeout"

**Causa**: Firewall bloqueando
**Solução**:
1. Adicione IP do App Service no firewall do SQL
2. Ou habilite "Allow Azure Services"

### Cenário 2: "Pool is destroyed"

**Causa**: Pool foi fechado mas não recriado
**Solução**: A implementação atual detecta e recria automaticamente

### Cenário 3: "Login failed"

**Causa**: Credenciais incorretas ou expiradas
**Solução**:
1. Verifique variáveis de ambiente no App Service
2. Confirme user/password no Azure SQL

### Cenário 4: "Operation timed out"

**Causa**: Query demorada ou banco sobrecarregado
**Solução**:
1. Aumente DTUs do banco
2. Otimize queries
3. Adicione índices

### Cenário 5: "Too many connections"

**Causa**: Pool excedeu limite
**Solução**: Ajuste `pool.max` no config

## Monitoramento Proativo

### Application Insights

Configure Application Insights no App Service:

```javascript
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .start();
```

### Alertas Recomendados

No Azure Monitor, crie alertas para:
- DTU > 80%
- Conexões > 90% do limite
- Erros de conexão > 5 em 5 minutos
- Latência de query > 1000ms

## Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Variáveis de ambiente configuradas
- [ ] Firewall do SQL configurado
- [ ] Always On habilitado (se plano permite)
- [ ] Health check configurado
- [ ] Connection policy definida
- [ ] Auto-pause desabilitado (se Serverless)
- [ ] Pool min >= 2 no código
- [ ] Keep-alive implementado
- [ ] Logs configurados

## Contato e Suporte

Se o problema persistir após seguir este guia:

1. Verifique logs detalhados no Azure Portal
2. Execute diagnóstico de conexão no Portal
3. Verifique métricas do SQL Database
4. Considere aumentar tier do banco se houver muitas conexões

## Código de Exemplo para Teste

```javascript
// Teste manual de reconexão
async function testReconnection() {
  const { getPool } = require('./db/connection');
  
  for (let i = 0; i < 5; i++) {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT 1 AS test');
      console.log(`Teste ${i + 1}: ✓ Conectado`);
    } catch (err) {
      console.error(`Teste ${i + 1}: ✗ Erro:`, err.message);
    }
    
    // Aguarda 2 minutos entre testes
    await new Promise(resolve => setTimeout(resolve, 120000));
  }
}
```

## Referências

- [Azure SQL Connection Pooling](https://docs.microsoft.com/en-us/azure/azure-sql/database/connect-query-nodejs)
- [mssql npm package](https://www.npmjs.com/package/mssql)
- [Azure App Service Best Practices](https://docs.microsoft.com/en-us/azure/app-service/app-service-best-practices)

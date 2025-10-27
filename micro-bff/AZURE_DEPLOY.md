# Guia de Deploy no Azure

Este guia fornece instruções para fazer deploy do BFF API Gateway no Azure.

## Opções de Deploy no Azure

### Opção 1: Azure Container Instances (ACI) - Mais Simples

#### Pré-requisitos
- Azure CLI instalado
- Conta Azure ativa
- Docker instalado localmente

#### Passos

1. **Login no Azure CLI**
```bash
az login
```

2. **Criar Resource Group** (se não existir)
```bash
az group create --name levaja-rg --location eastus
```

3. **Criar Azure Container Registry** (opcional, para armazenar a imagem)
```bash
# Criar registry
az acr create --resource-group levaja-rg --name levajaacr --sku Basic

# Login no registry
az acr login --name levajaacr

# Build e push da imagem
docker build -t levajaacr.azurecr.io/micro-bff:latest .
docker push levajaacr.azurecr.io/micro-bff:latest
```

4. **Deploy no Container Instance**
```bash
az container create \
  --resource-group levaja-rg \
  --name micro-bff \
  --image levajaacr.azurecr.io/micro-bff:latest \
  --registry-login-server levajaacr.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --dns-name-label levaja-bff \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
    PORT=3000 \
    USER_SERVICE_URL=https://seu-servico-usuarios.azurewebsites.net \
    PRODUCT_SERVICE_URL=https://seu-servico-produtos.azurewebsites.net \
    CORS_ORIGIN=https://seu-frontend.azurewebsites.net \
    REQUEST_TIMEOUT=5000 \
    LOG_LEVEL=info
```

5. **Verificar Deploy**
```bash
az container show --resource-group levaja-rg --name micro-bff --query "{FQDN:ipAddress.fqdn,ProvisioningState:provisioningState}" --out table
```

Acesse: `http://levaja-bff.eastus.azurecontainer.io:3000/api/v1/health`

---

### Opção 2: Azure App Service - Recomendado para Produção

#### Passos

1. **Criar App Service Plan**
```bash
az appservice plan create \
  --name levaja-plan \
  --resource-group levaja-rg \
  --is-linux \
  --sku B1
```

2. **Criar Web App**
```bash
az webapp create \
  --resource-group levaja-rg \
  --plan levaja-plan \
  --name levaja-bff \
  --deployment-container-image-name levajaacr.azurecr.io/micro-bff:latest
```

3. **Configurar Variáveis de Ambiente**
```bash
az webapp config appsettings set \
  --resource-group levaja-rg \
  --name levaja-bff \
  --settings \
    NODE_ENV=production \
    PORT=3000 \
    USER_SERVICE_URL=https://seu-servico-usuarios.azurewebsites.net \
    PRODUCT_SERVICE_URL=https://seu-servico-produtos.azurewebsites.net \
    CORS_ORIGIN=https://seu-frontend.azurewebsites.net \
    REQUEST_TIMEOUT=5000 \
    LOG_LEVEL=info \
    WEBSITES_PORT=3000
```

4. **Configurar ACR (se usar Azure Container Registry)**
```bash
az webapp config container set \
  --name levaja-bff \
  --resource-group levaja-rg \
  --docker-custom-image-name levajaacr.azurecr.io/micro-bff:latest \
  --docker-registry-server-url https://levajaacr.azurecr.io \
  --docker-registry-server-user <username> \
  --docker-registry-server-password <password>
```

5. **Habilitar Logs**
```bash
az webapp log config \
  --name levaja-bff \
  --resource-group levaja-rg \
  --docker-container-logging filesystem
```

6. **Ver Logs**
```bash
az webapp log tail --name levaja-bff --resource-group levaja-rg
```

Acesse: `https://levaja-bff.azurewebsites.net/api/v1/health`

---

### Opção 3: Azure Kubernetes Service (AKS) - Para Alta Escala

Para ambientes com necessidade de alta disponibilidade e escala:

1. **Criar cluster AKS**
```bash
az aks create \
  --resource-group levaja-rg \
  --name levaja-cluster \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys
```

2. **Conectar ao cluster**
```bash
az aks get-credentials --resource-group levaja-rg --name levaja-cluster
```

3. **Criar arquivo de deployment** (`k8s-deployment.yaml`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: micro-bff
spec:
  replicas: 3
  selector:
    matchLabels:
      app: micro-bff
  template:
    metadata:
      labels:
        app: micro-bff
    spec:
      containers:
      - name: micro-bff
        image: levajaacr.azurecr.io/micro-bff:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: USER_SERVICE_URL
          value: "https://seu-servico-usuarios"
        - name: PRODUCT_SERVICE_URL
          value: "https://seu-servico-produtos"
        - name: CORS_ORIGIN
          value: "https://seu-frontend"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: micro-bff-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: micro-bff
```

4. **Deploy no Kubernetes**
```bash
kubectl apply -f k8s-deployment.yaml
```

---

## Build e Test Local com Docker

### Build da Imagem
```bash
cd micro-bff
docker build -t micro-bff:latest .
```

### Test Local
```bash
docker run -d \
  -p 3000:3000 \
  -e USER_SERVICE_URL=http://host.docker.internal:3001 \
  -e PRODUCT_SERVICE_URL=http://host.docker.internal:3002 \
  -e CORS_ORIGIN=http://localhost:4200 \
  --name micro-bff-test \
  micro-bff:latest

# Verificar logs
docker logs -f micro-bff-test

# Testar health check
curl http://localhost:3000/api/v1/health
```

### Usando Docker Compose
```bash
# Start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Verificações Importantes Antes do Deploy

### ✅ Checklist

1. **Variáveis de Ambiente**
   - [ ] `USER_SERVICE_URL` configurada com URL do serviço de usuários
   - [ ] `PRODUCT_SERVICE_URL` configurada com URL do serviço de produtos
   - [ ] `CORS_ORIGIN` configurada com domínio(s) do frontend
   - [ ] `NODE_ENV=production`

2. **Segurança**
   - [ ] CORS configurado com origens específicas (não usar `*`)
   - [ ] Secrets/passwords não commitados no repositório
   - [ ] HTTPS habilitado no Azure (padrão)

3. **Monitoramento**
   - [ ] Health check endpoint funcionando (`/api/v1/health`)
   - [ ] Logs habilitados no Azure
   - [ ] Application Insights configurado (opcional)

4. **Rede**
   - [ ] Microsserviços downstream acessíveis
   - [ ] Portas corretas configuradas
   - [ ] Firewall/NSG configurado se necessário

---

## Troubleshooting

### Container não inicia
```bash
# Ver logs do container
docker logs <container-id>

# No Azure
az container logs --resource-group levaja-rg --name micro-bff
```

### Erro de conexão com microsserviços
- Verificar se as URLs dos serviços estão corretas
- Testar conectividade de rede
- Verificar se os serviços estão rodando

### Erro de CORS
- Verificar configuração da variável `CORS_ORIGIN`
- Deve incluir o protocolo: `https://` ou `http://`
- Para múltiplas origens: `https://app1.com,https://app2.com`

---

## Recursos Úteis

- [Azure Container Instances](https://docs.microsoft.com/azure/container-instances/)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Azure Kubernetes Service](https://docs.microsoft.com/azure/aks/)
- [Docker Documentation](https://docs.docker.com/)

---

## Custos Estimados (Azure)

- **Container Instances**: ~$14/mês (1 vCPU, 1.5GB RAM)
- **App Service B1**: ~$13/mês (1 core, 1.75GB RAM)
- **AKS**: Variável (cobrado por VMs utilizadas)

Preços podem variar por região. Consulte [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/).

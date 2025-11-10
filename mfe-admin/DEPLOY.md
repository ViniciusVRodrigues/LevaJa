# Guia de Deploy - Frontend (mfe-admin)

Este guia explica como fazer o deploy do frontend da aplicação.

## Pré-requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0

## Instalação de Dependências

Antes de fazer o build, você precisa instalar as dependências:

```bash
cd mfe-admin
npm install
```

## Build para Produção

Para gerar os arquivos de produção:

```bash
npm run build
```

Isso irá:
1. Compilar o código React
2. Otimizar os assets
3. Gerar os arquivos na pasta `dist/`

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `mfe-admin/` com as seguintes variáveis:

```env
# URL da API do BFF
VITE_API_URL=https://seu-bff.azurewebsites.net/api/v1

# Outras configurações (opcional)
VITE_ENV=production
```

## Deploy para Azure Static Web Apps

### Opção 1: Via Azure Portal

1. Crie um Azure Static Web App no portal
2. Configure o source como GitHub
3. Selecione o repositório e branch
4. Configure o build:
   - **App location**: `/mfe-admin`
   - **Api location**: (deixe vazio)
   - **Output location**: `dist`

### Opção 2: Via GitHub Actions (Automático)

O repositório já possui workflow configurado. Quando você fizer push para a branch principal, o deploy será automático.

### Opção 3: Deploy Manual

Se preferir fazer deploy manual:

```bash
# 1. Instale o Azure CLI
# 2. Faça login
az login

# 3. Instale a extensão Static Web Apps
az extension add --name staticwebapp

# 4. Faça o build
npm run build

# 5. Deploy
az staticwebapp deploy \
  --name seu-app-name \
  --resource-group seu-resource-group \
  --app-location mfe-admin \
  --output-location dist
```

## Deploy para Vercel

```bash
# 1. Instale Vercel CLI
npm install -g vercel

# 2. Execute deploy
cd mfe-admin
vercel --prod
```

Configure no Vercel:
- **Framework Preset**: Vite
- **Root Directory**: `mfe-admin`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Adicione `VITE_API_URL`

## Deploy para Netlify

```bash
# 1. Instale Netlify CLI
npm install -g netlify-cli

# 2. Execute deploy
cd mfe-admin
netlify deploy --prod --dir=dist
```

Configure no `netlify.toml`:

```toml
[build]
  base = "mfe-admin"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ A aplicação carrega corretamente
2. ✅ As rotas funcionam (Dashboard, Auditoria, Relatórios)
3. ✅ A comunicação com a API funciona
4. ✅ Não há erros no console do navegador

## Troubleshooting

### Erro: "vite: not found"

**Solução**: Execute `npm install` antes de fazer build

### Erro: "Cannot connect to API"

**Solução**: Verifique se a variável `VITE_API_URL` está configurada corretamente

### Erro: "404 em rotas"

**Solução**: Configure redirects/rewrites no servidor para SPA:
- Para Azure Static Web Apps: arquivo `staticwebapp.config.json`
- Para Netlify: arquivo `netlify.toml`
- Para Vercel: arquivo `vercel.json`

### Build demora muito

**Solução**: O build pode demorar de 2-5 minutos na primeira vez. Builds subsequentes serão mais rápidos devido ao cache.

## Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint do código
npm run lint
```

## Configuração de SPA (Single Page Application)

Para que as rotas funcionem corretamente, adicione o arquivo `staticwebapp.config.json`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*"]
  }
}
```

## Performance

O build otimizado inclui:
- ✅ Code splitting automático
- ✅ Minificação de JS/CSS
- ✅ Tree shaking
- ✅ Lazy loading de rotas
- ✅ Assets otimizados

Tamanho aproximado do build: **~500KB gzipped**

# Microserviço de Lotes de Produtos - MongoDB

Microserviço responsável pelo gerenciamento de lotes de produtos utilizando MongoDB.

## Funcionalidades

- CRUD completo de lotes de produtos
- Conexão com MongoDB
- Paginação de resultados
- Filtro por categoria
- Atualização de estoque
- API REST compatível com o BFF

## Tecnologias

- **Node.js** com Express
- **MongoDB** (Mongoose)
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
PORT=3002
MONGODB_URI=mongodb://localhost:27017/levaja-products
CORS_ORIGIN=http://localhost:3000
```

### MongoDB

#### Local
```bash
# Com Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Ou instale MongoDB localmente
```

#### MongoDB Atlas (Cloud)
1. Crie cluster gratuito no MongoDB Atlas
2. Configure usuário e senha
3. Obtenha connection string
4. Configure no `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/levaja-products
```

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

### Lotes de Produtos

#### Listar produtos (paginado e com filtro)
```
GET /lotes-produtos?limit=10&offset=0&categoria=Alimentos
```

#### Buscar produto por ID
```
GET /lotes-produtos/:id
```

#### Criar produto
```
POST /lotes-produtos
Content-Type: application/json

{
  "nome": "Arroz Integral 1kg",
  "categoria": "Alimentos",
  "estoque": 100,
  "valor": 15.90,
  "validade": "2025-12-31"
}
```

#### Atualizar produto
```
PUT /lotes-produtos/:id
Content-Type: application/json

{
  "nome": "Arroz Integral 1kg Premium",
  "estoque": 150,
  "valor": 17.90
}
```

#### Atualizar apenas estoque
```
PATCH /lotes-produtos/:id/estoque
Content-Type: application/json

{
  "estoque": 200
}
```

#### Deletar produto
```
DELETE /lotes-produtos/:id
```

## Docker

### Build
```bash
docker build -t micro-mongo .
```

### Run
```bash
docker run -p 3002:3002 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/levaja-products \
  micro-mongo
```

### Docker Compose
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  micro-mongo:
    build: .
    ports:
      - "3002:3002"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/levaja-products
    depends_on:
      - mongodb

volumes:
  mongo-data:
```

## Schema do Banco

```javascript
{
  nome: String (3-150 chars, required),
  categoria: String (required),
  estoque: Number (min 0, required),
  valor: Number (min 0, required),
  validade: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Integração com BFF

O BFF se comunica com este microserviço via HTTP:

```javascript
// No BFF
const response = await axios.get('http://localhost:3002/lotes-produtos');
```

Configure `PRODUCT_SERVICE_URL` no BFF para apontar para este microserviço.

## Índices

- `categoria`: Para busca eficiente por categoria

## Validações

- Nome: 3-150 caracteres
- Estoque: >= 0
- Valor: >= 0
- Categoria: obrigatório
- Validade: opcional, formato ISO date

## Troubleshooting

### Erro de Conexão MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Verifique se MongoDB está rodando
- Teste: `mongo` ou `mongosh`

### Erro de Autenticação
```
Error: Authentication failed
```
- Verifique usuário/senha na connection string
- No MongoDB Atlas, verifique whitelist de IPs

### ID Inválido
```
Error: Cast to ObjectId failed
```
- IDs devem ser ObjectId válidos (24 caracteres hex)

## Deploy no Azure

Este microserviço pode ser deployado em:
- Azure App Service (com MongoDB Atlas)
- Azure Container Instances
- Azure Kubernetes Service

Para MongoDB, use:
- MongoDB Atlas (recomendado)
- Azure Cosmos DB com API MongoDB

Ver `../micro-bff/AZURE_DEPLOY.md` para guia completo.

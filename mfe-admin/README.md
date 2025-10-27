# LevaJá Admin - Frontend React

Interface administrativa em React para gerenciamento de usuários e produtos do sistema LevaJá.

## Funcionalidades

- ✅ CRUD completo de Usuários
- ✅ CRUD completo de Lotes de Produtos
- ✅ Filtros e paginação
- ✅ Interface responsiva
- ✅ Integração com API BFF
- ✅ Validação de formulários
- ✅ Feedback visual de erros

## Tecnologias

- **React 19** - Framework JavaScript
- **Vite** - Build tool e dev server (Rolldown)
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **CSS3** - Estilização

## Requisitos

- **Node.js v20 ou superior** (obrigatório)
- npm v10 ou superior

O projeto requer Node.js v20+ devido às dependências React 19 e Vite/Rolldown. O arquivo `.nvmrc` está configurado para garantir a versão correta.

## Instalação e Execução

```bash
# Verificar versão do Node (deve ser v20+)
node --version

# Se necessário, use nvm para mudar para Node 20
nvm use 20

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

Acesse: `http://localhost:5173`

## Estrutura

- `src/components/` - Componentes reutilizáveis
- `src/pages/` - Páginas (Home, Users, Products)
- `src/services/` - Integração com API
- `src/App.jsx` - Rotas principais

## Integração com BFF

Configure a URL da API em `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Deploy no Azure Static Web Apps

O projeto está pronto para deploy no Azure Static Web Apps. O arquivo `.nvmrc` garante que o Azure use Node.js v20 durante o build.

Se encontrar erros de versão do Node durante o deploy:
1. Verifique que `.nvmrc` contém `20`
2. Verifique que `package.json` tem o campo `engines` configurado
3. Se usar GitHub Actions, adicione `NODE_VERSION: '20'` nas variáveis de ambiente

## Troubleshooting

### Erro: "EBADENGINE Unsupported engine"
**Solução**: Você está usando Node.js v18 ou inferior. Atualize para Node.js v20:
```bash
nvm install 20
nvm use 20
```

### Build falha no Azure
**Solução**: Certifique-se de que o Azure Static Web Apps está configurado para usar Node.js v20. O arquivo `.nvmrc` deve estar presente no repositório.

## Licença

ISC

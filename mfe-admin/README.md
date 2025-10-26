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
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **CSS3** - Estilização

## Instalação e Execução

```bash
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

## Licença

ISC

# LevaJá - WebApp Administrativo

Sistema administrativo completo para gerenciamento do LevaJá, desenvolvido em React + TypeScript.

## 🚀 Funcionalidades Principais

### ✅ Implementadas
- **Dashboard com Métricas**: Visão geral com métricas principais
- **Sistema de Autenticação**: Login/logout com usuário demo
- **Estrutura Completa**: Layout responsivo com sidebar e header
- **Navegação**: Sistema de rotas e navegação lateral
- **Sistema de Notificações**: Notificações em tempo real
- **Tema Customizado**: Design Material-UI moderno
- **Hooks Customizados**: Para gerenciamento de estado e API
- **Mock de Dados**: Dados simulados para todas as funcionalidades

### 🔄 Em Desenvolvimento
- **Gerenciamento de Produtos**: Listagem, cadastro e controle de vencimentos
- **Gerenciamento de Funcionários**: Cadastro e associação a setores
- **Gerenciamento de Setores**: Criação e configuração de setores
- **Motor de Promoções**: Criação automática e manual de promoções
- **Relatórios e Analytics**: Dashboards e exportação de dados
- **Configurações**: Configurações do sistema e integrações

## 🛠️ Tecnologias Utilizadas

- **React 18** - Library principal
- **TypeScript** - Tipagem estática
- **Material-UI (MUI)** - Componentes de interface
- **React Router** - Navegação
- **React Query (TanStack Query)** - Gerenciamento de estado servidor
- **Axios** - Requisições HTTP
- **Date-fns** - Manipulação de datas
- **Recharts** - Gráficos e visualizações
- **Vite** - Build tool e dev server

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
cd webapp
npm install
```

### Desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:5173`

### Build para Produção
```bash
npm run build
```

### Prévia da Build
```bash
npm run preview
```

## 🔐 Login Demo

Para acessar o sistema, use as credenciais:
- **Email**: joao.silva@levaja.com
- **Senha**: demo123

## 🏗️ Estrutura do Projeto

```
webapp/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Header.tsx    # Cabeçalho da aplicação
│   │   ├── Sidebar.tsx   # Menu lateral
│   │   └── Layout.tsx    # Layout principal
│   ├── pages/            # Páginas da aplicação
│   │   └── Dashboard.tsx # Dashboard principal
│   ├── services/         # Serviços e APIs
│   │   ├── api.ts       # Cliente da API
│   │   └── mockData.ts  # Dados de demonstração
│   ├── hooks/           # Hooks customizados
│   │   └── index.ts    # Hooks para auth, data fetching, etc.
│   ├── utils/          # Utilitários
│   │   └── index.ts   # Funções auxiliares
│   ├── types/         # Definições de tipos TypeScript
│   │   └── index.ts  # Interfaces e types
│   ├── styles/       # Estilos e temas
│   │   └── theme.ts # Tema Material-UI
│   ├── App.tsx      # Componente principal
│   └── main.tsx     # Ponto de entrada
├── package.json
└── README.md
```

## 🎨 Funcionalidades da Interface

### Dashboard
- **Métricas em Tempo Real**: Produtos, vencimentos, promoções e receita
- **Cards Interativos**: Com indicadores de tendência
- **Design Responsivo**: Adaptável para desktop e tablet

### Navegação
- **Sidebar Responsiva**: Menu lateral com categorias organizadas
- **Header com Notificações**: Sistema de notificações e perfil do usuário
- **Breadcrumbs**: Navegação contextual (implementação futura)

### Sistema de Notificações
- **Notificações em Tempo Real**: Alertas sobre produtos e estoque
- **Badge de Contagem**: Indicador visual de notificações não lidas
- **Menu Dropdown**: Acesso rápido às notificações

## 🔧 Próximos Passos

### Páginas Prioritárias
1. **Produtos** - Listagem com filtros e busca
2. **Funcionários** - CRUD completo com associação a setores
3. **Setores** - Gerenciamento de departamentos
4. **Promoções** - Motor de promoções automáticas

### Funcionalidades Avançadas
- **Sistema de Busca Global**: Busca unificada em toda a aplicação
- **Filtros Avançados**: Filtros inteligentes por categoria, data, status
- **Export de Dados**: CSV, PDF e Excel
- **Gráficos Interativos**: Dashboards avançados
- **Sistema de Permissões**: Controle de acesso por função

## 🌟 Características Técnicas

### Performance
- **Code Splitting**: Carregamento sob demanda
- **Tree Shaking**: Remoção de código não utilizado
- **Memoização**: Otimização de re-renders
- **Lazy Loading**: Carregamento preguiçoso de componentes

### Qualidade de Código
- **TypeScript**: Tipagem forte em todo o projeto
- **ESLint**: Linting e padronização de código
- **Hooks Customizados**: Reutilização de lógica
- **Error Boundaries**: Tratamento de erros (implementação futura)

### UX/UI
- **Material Design**: Interface consistente e familiar
- **Responsive Design**: Adaptável a diferentes telas
- **Skeleton Loading**: Indicadores de carregamento
- **Toast Notifications**: Feedback visual das ações

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Prévia da build de produção
- `npm run lint` - Executa o linter

## 🤝 Contribuição

Este projeto segue as melhores práticas de desenvolvimento React e está estruturado para facilitar a contribuição e manutenção.

### Padrões de Código
- Componentes funcionais com hooks
- TypeScript para tipagem
- Material-UI para componentes
- Estrutura de pastas organizada
- Hooks customizados para lógica reutilizável

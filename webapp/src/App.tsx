import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { useAuth } from './hooks';

// Login Component (Simple for demo)
const Login: React.FC = () => {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    await login('joao.silva@levaja.com', 'demo123');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          textAlign: 'center',
        }}
      >
        <h1>LevaJá - Admin</h1>
        <p>Clique para fazer login com usuário demo</p>
        <button onClick={handleLogin} style={{ padding: '12px 24px', fontSize: '16px' }}>
          Login Demo (admin)
        </button>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Email: joao.silva@levaja.com<br />
          Senha: demo123
        </p>
      </Box>
    </Box>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="produtos" element={<div>Produtos (Em desenvolvimento)</div>} />
        <Route path="funcionarios" element={<div>Funcionários (Em desenvolvimento)</div>} />
        <Route path="setores" element={<div>Setores (Em desenvolvimento)</div>} />
        <Route path="promocoes" element={<div>Promoções (Em desenvolvimento)</div>} />
        <Route path="promocoes/sugestoes" element={<div>Sugestões (Em desenvolvimento)</div>} />
        <Route path="relatorios/*" element={<div>Relatórios (Em desenvolvimento)</div>} />
        <Route path="notificacoes" element={<div>Notificações (Em desenvolvimento)</div>} />
        <Route path="configuracoes" element={<div>Configurações (Em desenvolvimento)</div>} />
      </Route>
    </Routes>
  );
}

export default App;

import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Bem-vindo ao LevaJá Admin</h1>
        <p>Sistema de gerenciamento de usuários e produtos com monitoramento em tempo real</p>
      </div>

      <div className="home-cards">
        <Link to="/dashboard" className="home-card">
          <div className="card-icon">📊</div>
          <h2>Dashboard</h2>
          <p>Visão geral com dados agregados e alertas</p>
        </Link>

        <Link to="/usuarios" className="home-card">
          <div className="card-icon">👥</div>
          <h2>Gerenciar Usuários</h2>
          <p>Criar, editar e visualizar usuários do sistema</p>
        </Link>

        <Link to="/produtos" className="home-card">
          <div className="card-icon">📦</div>
          <h2>Gerenciar Produtos</h2>
          <p>Controlar lotes de produtos e estoque</p>
        </Link>

        <Link to="/relatorios" className="home-card">
          <div className="card-icon">📈</div>
          <h2>Relatórios</h2>
          <p>Estoque baixo e vencimentos próximos</p>
        </Link>

        <Link to="/auditoria" className="home-card">
          <div className="card-icon">📋</div>
          <h2>Auditoria</h2>
          <p>Logs de eventos e estatísticas</p>
        </Link>
      </div>

      <div className="home-info">
        <h3>Recursos do Sistema</h3>
        <ul>
          <li>CRUD completo de usuários e produtos</li>
          <li>Dashboard com agregação de dados em tempo real</li>
          <li>Relatórios de estoque baixo e vencimentos</li>
          <li>Logs de auditoria com Azure Functions</li>
          <li>Eventos via Azure Service Bus</li>
          <li>Filtros, paginação e interface responsiva</li>
          <li>Integração completa com BFF API Gateway</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;

import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Bem-vindo ao LevaJá Admin</h1>
        <p>Sistema de gerenciamento de usuários e produtos</p>
      </div>

      <div className="home-cards">
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
      </div>

      <div className="home-info">
        <h3>Recursos do Sistema</h3>
        <ul>
          <li>CRUD completo de usuários</li>
          <li>CRUD completo de lotes de produtos</li>
          <li>Filtros e paginação</li>
          <li>Interface responsiva e intuitiva</li>
          <li>Integração com API REST</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;

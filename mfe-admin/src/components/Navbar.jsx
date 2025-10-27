import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          LevaJá Admin
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          </li>
          <li>
            <Link to="/usuarios" className="navbar-link">Usuários</Link>
          </li>
          <li>
            <Link to="/produtos" className="navbar-link">Produtos</Link>
          </li>
          <li>
            <Link to="/relatorios" className="navbar-link">Relatórios</Link>
          </li>
          <li>
            <Link to="/auditoria" className="navbar-link">Auditoria</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

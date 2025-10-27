import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import Dashboard from './pages/dashboard/Dashboard';
import Reports from './pages/reports/Reports';
import Audit from './pages/audit/Audit';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<UserList />} />
            <Route path="/usuarios/novo" element={<UserForm />} />
            <Route path="/usuarios/editar/:id" element={<UserForm />} />
            <Route path="/produtos" element={<ProductList />} />
            <Route path="/produtos/novo" element={<ProductForm />} />
            <Route path="/produtos/editar/:id" element={<ProductForm />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/auditoria" element={<Audit />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

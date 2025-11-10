import { useState, useEffect } from 'react';
import { getDashboard } from '../../services/aggregationService';
import Loading from '../../components/Loading';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError('Erro ao carregar dashboard');
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard - Visão Geral</h1>
      
      <div className="dashboard-grid">
        {/* Estatísticas de Usuários */}
        <div className="dashboard-card">
          <h2>👥 Usuários</h2>
          <div className="stat-value">{data?.totalUsers || 0}</div>
          <div className="stat-label">Total de Usuários</div>
          {data?.userStatistics?.statistics && (
            <div className="stat-details">
              <p>Criados via eventos: {data.userStatistics.statistics.totalUsuariosCriados || 0}</p>
              <p>Criados hoje: {data.userStatistics.statistics.usuariosCriadosHoje || 0}</p>
            </div>
          )}
        </div>

        {/* Estatísticas de Produtos */}
        <div className="dashboard-card">
          <h2>📦 Produtos</h2>
          <div className="stat-value">{data?.totalProducts || 0}</div>
          <div className="stat-label">Total de Produtos</div>
        </div>

        {/* Alertas de Estoque Baixo */}
        <div className="dashboard-card alert-card">
          <h2>⚠️ Estoque Baixo</h2>
          <div className="stat-value alert-value">
            {Array.isArray(data?.lowStockAlerts) ? data.lowStockAlerts.length : 0}
          </div>
          <div className="stat-label">Produtos com Estoque ≤ 50</div>
          {Array.isArray(data?.lowStockAlerts) && data.lowStockAlerts.length > 0 && (
            <div className="alert-list">
              {data.lowStockAlerts.slice(0, 3).map((product, index) => (
                <div key={index} className="alert-item">
                  <strong>{product.nome}</strong>: {product.estoque} unidades
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de Vencimento Próximo */}
        <div className="dashboard-card alert-card">
          <h2>📅 Vencimentos Próximos</h2>
          <div className="stat-value alert-value">
            {Array.isArray(data?.nearExpirationAlerts) ? data.nearExpirationAlerts.length : 0}
          </div>
          <div className="stat-label">Produtos Vencendo em ≤ 30 dias</div>
          {Array.isArray(data?.nearExpirationAlerts) && data.nearExpirationAlerts.length > 0 && (
            <div className="alert-list">
              {data.nearExpirationAlerts.slice(0, 3).map((product, index) => (
                <div key={index} className="alert-item">
                  <strong>{product.nome}</strong>: {new Date(product.validade).toLocaleDateString()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Informações Adicionais */}
      {data && (
        <div className="dashboard-footer">
          <p>
            <strong>Fonte dos dados:</strong> Agregação em tempo real de micro-azure, 
            micro-mongo e Azure Functions
          </p>
          <button onClick={loadDashboard} className="refresh-button">
            🔄 Atualizar Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

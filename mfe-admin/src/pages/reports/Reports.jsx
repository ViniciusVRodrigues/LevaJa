import { useState, useEffect } from 'react';
import { getLowStockReport, getNearExpirationReport } from '../../services/reportService';
import Loading from '../../components/Loading';
import './Reports.css';

function Reports() {
  const [lowStock, setLowStock] = useState([]);
  const [nearExpiration, setNearExpiration] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lowStock');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const [lowStockData, nearExpirationData] = await Promise.all([
        getLowStockReport({ limit: 50 }),
        getNearExpirationReport({ limit: 50 })
      ]);
      setLowStock(lowStockData);
      setNearExpiration(nearExpirationData);
    } catch (err) {
      setError('Erro ao carregar relatórios');
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>📊 Relatórios e Alertas</h1>
        <button onClick={loadReports} className="refresh-button">
          🔄 Atualizar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'lowStock' ? 'active' : ''}`}
          onClick={() => setActiveTab('lowStock')}
        >
          ⚠️ Estoque Baixo ({lowStock.length})
        </button>
        <button 
          className={`tab ${activeTab === 'nearExpiration' ? 'active' : ''}`}
          onClick={() => setActiveTab('nearExpiration')}
        >
          📅 Vencimentos Próximos ({nearExpiration.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'lowStock' && (
          <div className="report-section">
            <h2>Produtos com Estoque Baixo (≤ 50 unidades)</h2>
            {lowStock.length === 0 ? (
              <p className="no-data">✅ Nenhum produto com estoque baixo</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Estoque</th>
                    <th>Valor</th>
                    <th>Validade</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product, index) => (
                    <tr key={index} className="alert-row">
                      <td>{product.nome}</td>
                      <td>{product.categoria}</td>
                      <td className="stock-low">{product.estoque} unidades</td>
                      <td>R$ {product.valor?.toFixed(2)}</td>
                      <td>{new Date(product.validade).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'nearExpiration' && (
          <div className="report-section">
            <h2>Produtos Próximos do Vencimento (≤ 30 dias)</h2>
            {nearExpiration.length === 0 ? (
              <p className="no-data">✅ Nenhum produto próximo do vencimento</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Estoque</th>
                    <th>Valor</th>
                    <th>Validade</th>
                    <th>Dias Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {nearExpiration.map((product, index) => {
                    const daysUntilExpiration = Math.ceil(
                      (new Date(product.validade) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={index} className="alert-row">
                        <td>{product.nome}</td>
                        <td>{product.categoria}</td>
                        <td>{product.estoque} unidades</td>
                        <td>R$ {product.valor?.toFixed(2)}</td>
                        <td className="expiration-date">
                          {new Date(product.validade).toLocaleDateString()}
                        </td>
                        <td className={daysUntilExpiration <= 7 ? 'critical' : 'warning'}>
                          {daysUntilExpiration} dias
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="report-footer">
        <p>
          <strong>Fonte:</strong> Azure Function 2 (function-produtos-auditoria) processando
          eventos do Service Bus
        </p>
      </div>
    </div>
  );
}

export default Reports;

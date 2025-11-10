import { useState, useEffect } from 'react';
import { getLowStockReportComplete, getNearExpirationReportComplete } from '../../services/reportService';
import Loading from '../../components/Loading';
import './Reports.css';

function Reports() {
  const [lowStockData, setLowStockData] = useState(null);
  const [nearExpirationData, setNearExpirationData] = useState(null);
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
      const [lowStockResult, nearExpirationResult] = await Promise.all([
        getLowStockReportComplete({ limit: 50 }),
        getNearExpirationReportComplete({ limit: 50 })
      ]);
      setLowStockData(lowStockResult);
      setNearExpirationData(nearExpirationResult);
    } catch (err) {
      setError('Erro ao carregar relatórios');
      console.error('Erro ao carregar relatórios:', err);
      setLowStockData(null);
      setNearExpirationData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const lowStock = lowStockData?.produtos || [];
  const nearExpiration = nearExpirationData?.produtosProximos || [];

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
          ⚠️ Estoque Baixo ({Array.isArray(lowStock) ? lowStock.length : 0})
        </button>
        <button 
          className={`tab ${activeTab === 'nearExpiration' ? 'active' : ''}`}
          onClick={() => setActiveTab('nearExpiration')}
        >
          📅 Vencimentos Próximos ({Array.isArray(nearExpiration) ? nearExpiration.length : 0})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'lowStock' && (
          <div className="report-section">
            <h2>Produtos com Estoque Baixo (≤ 50 unidades)</h2>
            
            {/* Verificação de Dados */}
            {lowStockData?.verification && (
              <div className="verification-panel">
                <h3>🔍 Verificação de Integridade (MongoDB)</h3>
                <div className="verification-stats">
                  <div className="verification-item">
                    <span className="verification-label">Total Produtos MongoDB:</span>
                    <span className="verification-value">{lowStockData.verification.totalProdutosMongoDB || 0}</span>
                  </div>
                  <div className="verification-item">
                    <span className="verification-label">Produtos com Estoque Baixo (Real):</span>
                    <span className="verification-value">{lowStockData.verification.produtosAtivosComEstoqueBaixo || 0}</span>
                  </div>
                  <div className="verification-item">
                    <span className="verification-label">Inconsistências:</span>
                    <span className={`verification-value ${lowStockData.verification.totalInconsistencias > 0 ? 'warning' : 'success'}`}>
                      {lowStockData.verification.totalInconsistencias || 0}
                    </span>
                  </div>
                </div>
                
                {lowStockData.verification.inconsistencias && lowStockData.verification.inconsistencias.length > 0 && (
                  <div className="inconsistencies-list">
                    {lowStockData.verification.inconsistencias.map((inc, index) => (
                      <div key={index} className={`inconsistency-item severity-${inc.severidade?.toLowerCase()}`}>
                        <span className="inconsistency-type">{inc.tipo}</span>
                        <span className="inconsistency-message">{inc.mensagem}</span>
                        <span className={`inconsistency-severity badge-${inc.severidade?.toLowerCase()}`}>
                          {inc.severidade}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {!Array.isArray(lowStock) || lowStock.length === 0 ? (
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
            
            {/* Verificação de Dados */}
            {nearExpirationData?.verification && (
              <div className="verification-panel">
                <h3>🔍 Verificação de Integridade (MongoDB)</h3>
                <div className="verification-stats">
                  <div className="verification-item">
                    <span className="verification-label">Produtos Vencendo (Real):</span>
                    <span className="verification-value">{nearExpirationData.verification.produtosVencendoMongoDB || 0}</span>
                  </div>
                  <div className="verification-item">
                    <span className="verification-label">Produtos Vencidos (Real):</span>
                    <span className="verification-value warning">{nearExpirationData.verification.produtosVencidosMongoDB || 0}</span>
                  </div>
                  <div className="verification-item">
                    <span className="verification-label">Inconsistências:</span>
                    <span className={`verification-value ${nearExpirationData.verification.totalInconsistencias > 0 ? 'warning' : 'success'}`}>
                      {nearExpirationData.verification.totalInconsistencias || 0}
                    </span>
                  </div>
                </div>
                
                {nearExpirationData.verification.inconsistencias && nearExpirationData.verification.inconsistencias.length > 0 && (
                  <div className="inconsistencies-list">
                    {nearExpirationData.verification.inconsistencias.map((inc, index) => (
                      <div key={index} className={`inconsistency-item severity-${inc.severidade?.toLowerCase()}`}>
                        <span className="inconsistency-type">{inc.tipo}</span>
                        <span className="inconsistency-message">{inc.mensagem}</span>
                        <span className={`inconsistency-severity badge-${inc.severidade?.toLowerCase()}`}>
                          {inc.severidade}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {!Array.isArray(nearExpiration) || nearExpiration.length === 0 ? (
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

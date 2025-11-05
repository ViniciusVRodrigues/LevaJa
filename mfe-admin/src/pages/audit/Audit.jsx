import { useState, useEffect } from 'react';
import { getUserAuditLogs, getProductAuditLogs, getUserStatistics } from '../../services/statisticsService';
import Loading from '../../components/Loading';
import './Audit.css';

function Audit() {
  const [userAudits, setUserAudits] = useState([]);
  const [productAudits, setProductAudits] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      setError('');
      const [userAuditData, productAuditData, statsData] = await Promise.all([
        getUserAuditLogs({ limit: 50, offset: 0 }),
        getProductAuditLogs({ limit: 50, offset: 0 }),
        getUserStatistics()
      ]);
      setUserAudits(userAuditData);
      setProductAudits(productAuditData);
      setStatistics(statsData);
    } catch (err) {
      setError('Erro ao carregar logs de auditoria');
      console.error('Erro ao carregar auditoria:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const currentAudits = activeTab === 'users' ? userAudits : productAudits;
  const paginatedAudits = currentAudits.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(currentAudits.length / itemsPerPage);

  return (
    <div className="audit">
      <div className="audit-header">
        <h1>📋 Logs de Auditoria</h1>
        <button onClick={loadAudits} className="refresh-button">
          🔄 Atualizar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Estatísticas */}
      {statistics && activeTab === 'users' && (
        <>
          <div className="statistics-panel">
            <div className="stat-card">
              <div className="stat-value">{statistics.totalCreated || 0}</div>
              <div className="stat-label">Total de Usuários Criados via Eventos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statistics.createdToday || 0}</div>
              <div className="stat-label">Criados Hoje</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {statistics.lastProcessed 
                  ? new Date(statistics.lastProcessed).toLocaleDateString()
                  : 'N/A'}
              </div>
              <div className="stat-label">Último Processamento</div>
            </div>
          </div>

          {/* Verificação de Dados */}
          {statistics.verification && (
            <div className="verification-panel">
              <h3>🔍 Verificação de Integridade de Dados</h3>
              <div className="verification-stats">
                <div className="verification-item">
                  <span className="verification-label">Usuários no Azure SQL:</span>
                  <span className="verification-value">{statistics.verification.totalUsuariosAzureSQL || 0}</span>
                </div>
                <div className="verification-item">
                  <span className="verification-label">Inconsistências Encontradas:</span>
                  <span className={`verification-value ${statistics.verification.totalInconsistencias > 0 ? 'warning' : 'success'}`}>
                    {statistics.verification.totalInconsistencias || 0}
                  </span>
                </div>
              </div>
              
              {statistics.verification.inconsistencias && statistics.verification.inconsistencias.length > 0 && (
                <div className="inconsistencies-list">
                  <h4>⚠️ Inconsistências Detectadas:</h4>
                  {statistics.verification.inconsistencias.map((inc, index) => (
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
              
              {(!statistics.verification.inconsistencias || statistics.verification.inconsistencias.length === 0) && (
                <div className="no-inconsistencies">
                  ✅ Nenhuma inconsistência detectada. Dados integros.
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setPage(0); }}
        >
          👥 Auditoria de Usuários ({userAudits.length})
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => { setActiveTab('products'); setPage(0); }}
        >
          📦 Auditoria de Produtos ({productAudits.length})
        </button>
      </div>

      <div className="tab-content">
        {paginatedAudits.length === 0 ? (
          <p className="no-data">Nenhum log de auditoria encontrado</p>
        ) : (
          <>
            <table className="audit-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{activeTab === 'users' ? 'Nome' : 'Produto'}</th>
                  <th>{activeTab === 'users' ? 'Email' : 'Categoria'}</th>
                  <th>Data do Evento</th>
                  <th>Processado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAudits.map((audit, index) => (
                  <tr key={index}>
                    <td className="id-cell">{audit.id || audit._id}</td>
                    <td>
                      {activeTab === 'users' 
                        ? audit.data?.nome || audit.nome
                        : audit.data?.nome || audit.nome}
                    </td>
                    <td>
                      {activeTab === 'users' 
                        ? audit.data?.email || audit.email
                        : audit.data?.categoria || audit.categoria}
                    </td>
                    <td>{new Date(audit.timestamp || audit.eventTimestamp).toLocaleString()}</td>
                    <td>{new Date(audit.processedAt || audit.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="pagination-button"
                >
                  Anterior
                </button>
                <span className="pagination-info">
                  Página {page + 1} de {totalPages}
                </span>
                <button 
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="pagination-button"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="audit-footer">
        <p>
          <strong>Fonte:</strong> Azure Functions processando eventos do Service Bus
          {activeTab === 'users' 
            ? ' (function-usuarios-auditoria → MongoDB)'
            : ' (function-produtos-auditoria → Azure SQL)'}
        </p>
      </div>
    </div>
  );
}

export default Audit;

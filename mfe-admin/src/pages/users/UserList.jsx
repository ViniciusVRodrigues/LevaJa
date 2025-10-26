import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';
import './UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0 });

  useEffect(() => {
    loadUsers();
  }, [pagination.offset]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll({
        limit: pagination.limit,
        offset: pagination.offset
      });
      setUsers(data.data || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) {
      return;
    }

    try {
      await userService.delete(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao deletar usuário');
    }
  };

  const nextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    }
  };

  const prevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gerenciar Usuários</h1>
        <Link to="/usuarios/novo" className="btn btn-primary">
          + Novo Usuário
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/usuarios/editar/${user.id}`} className="btn btn-sm btn-secondary">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={prevPage}
          disabled={pagination.offset === 0}
          className="btn btn-secondary"
        >
          Anterior
        </button>
        <span className="pagination-info">
          Mostrando {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total}
        </span>
        <button
          onClick={nextPage}
          disabled={pagination.offset + pagination.limit >= pagination.total}
          className="btn btn-secondary"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export default UserList;

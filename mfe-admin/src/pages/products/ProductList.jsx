import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import Loading from '../../components/Loading';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0 });

  useEffect(() => {
    loadProducts();
  }, [pagination.offset, categoria]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAll({
        limit: pagination.limit,
        offset: pagination.offset,
        categoria: categoria || undefined
      });
      setProducts(data.data || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }

    try {
      await productService.delete(id);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao deletar produto');
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
        <h1>Gerenciar Produtos</h1>
        <Link to="/produtos/novo" className="btn btn-primary">
          + Novo Produto
        </Link>
      </div>

      <div className="filter-container">
        <input
          type="text"
          placeholder="Filtrar por categoria..."
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="form-control"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Estoque</th>
              <th>Valor</th>
              <th>Validade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhum produto encontrado
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.nome}</td>
                  <td>{product.categoria}</td>
                  <td>{product.estoque}</td>
                  <td>R$ {product.valor?.toFixed(2)}</td>
                  <td>{product.validade ? new Date(product.validade).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/produtos/editar/${product.id}`} className="btn btn-sm btn-secondary">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
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

export default ProductList;

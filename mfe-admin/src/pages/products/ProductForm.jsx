import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import Loading from '../../components/Loading';
import './ProductForm.css';

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    estoque: 0,
    valor: 0,
    validade: ''
  });

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getById(id);
      setFormData({
        nome: data.nome || '',
        categoria: data.categoria || '',
        estoque: data.estoque || 0,
        valor: data.valor || 0,
        validade: data.validade ? data.validade.split('T')[0] : ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!formData.nome || formData.nome.length < 3) {
      setError('Nome deve ter no mínimo 3 caracteres');
      return;
    }

    if (!formData.categoria) {
      setError('Categoria é obrigatória');
      return;
    }

    if (formData.estoque < 0) {
      setError('Estoque não pode ser negativo');
      return;
    }

    if (formData.valor < 0) {
      setError('Valor não pode ser negativo');
      return;
    }

    try {
      setLoading(true);
      const dataToSend = { ...formData };
      if (!dataToSend.validade) {
        delete dataToSend.validade;
      }

      if (isEdit) {
        await productService.update(id, dataToSend);
      } else {
        await productService.create(dataToSend);
      }
      navigate('/produtos');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? 'Editar Produto' : 'Novo Produto'}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="nome">Nome *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={150}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoria *</label>
          <input
            type="text"
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Ex: Alimentos, Bebidas, etc."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estoque">Estoque *</label>
            <input
              type="number"
              id="estoque"
              name="estoque"
              value={formData.estoque}
              onChange={handleChange}
              required
              min="0"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="valor">Valor (R$) *</label>
            <input
              type="number"
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="validade">Data de Validade</label>
          <input
            type="date"
            id="validade"
            name="validade"
            value={formData.validade}
            onChange={handleChange}
            className="form-control"
          />
          <small className="form-text">Opcional</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;

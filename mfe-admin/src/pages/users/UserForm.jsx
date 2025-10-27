import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';
import './UserForm.css';

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  });

  useEffect(() => {
    if (isEdit) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getById(id);
      setFormData({
        nome: data.nome || '',
        email: data.email || '',
        senha: '' // Não carregar senha por segurança
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    if (!isEdit || formData.senha) {
      if (formData.senha.length < 8) {
        setError('Senha deve ter no mínimo 8 caracteres');
        return;
      }
    }

    try {
      setLoading(true);
      if (isEdit) {
        await userService.update(id, formData);
      } else {
        await userService.create(formData);
      }
      navigate('/usuarios');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h1>
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
            maxLength={100}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">
            Senha {isEdit ? '(deixe em branco para não alterar)' : '*'}
          </label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required={!isEdit}
            minLength={8}
            className="form-control"
          />
          <small className="form-text">Mínimo de 8 caracteres</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
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

export default UserForm;

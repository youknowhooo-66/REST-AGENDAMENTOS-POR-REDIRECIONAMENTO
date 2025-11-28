import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        // The service detail is public, but we need to check the user role to show the edit/delete buttons.
        const response = await api.get(`/public/services/${id}`);
        setService(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await api.delete(`/services/${id}`);
        toast.success('Serviço excluído com sucesso!');
        navigate('/services');
      } catch (error) {
        toast.error('Erro ao excluir o serviço.');
        console.error('Error deleting service:', error);
      }
    }
  };


  if (loading) return <div className="text-center p-4">Carregando detalhes do serviço...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;
  if (!service) return <div className="text-center p-4">Serviço não encontrado.</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Preço:</span> ${service.price.toFixed(2)}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Duração:</span> {service.durationMin} minutos
      </p>
      <p className="text-gray-700 mb-4">
        <span className="font-semibold">Descrição:</span> {service.description || 'N/A'}
      </p>
      
      <div className="flex space-x-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agendar Agora
        </button>
        {user && user.role === 'PROVIDER' && (
          <>
            <Link to={`/admin/services/edit/${id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              Editar
            </Link>
            <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Deletar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;

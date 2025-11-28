import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ServiceFormComponent from '../../components/ServiceForm/ServiceForm';
import { toast } from 'react-toastify';

const ServiceFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchService = async () => {
        try {
          const response = await api.get(`/services/${id}`);
          setService(response.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (serviceData) => {
    try {
      if (id) {
        await api.put(`/services/${id}`, serviceData);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await api.post('/services', serviceData);
        toast.success('Serviço criado com sucesso!');
      }
      navigate('/services');
    } catch (error) {
      toast.error('Erro ao salvar o serviço.');
      console.error('Error saving service:', error);
    }
  };

  if (loading) return <div className="text-center p-4">Carregando...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Editar Serviço' : 'Criar Serviço'}</h1>
      <ServiceFormComponent onSubmit={handleSubmit} serviceData={service} />
    </div>
  );
};

export default ServiceFormPage;

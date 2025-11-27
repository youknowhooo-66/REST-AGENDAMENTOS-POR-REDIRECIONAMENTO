import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        // TODO: Replace with actual API call to get service by ID
        const response = await new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ id: id, name: 'Haircut', price: 25.00, durationMin: 30, description: 'A professional haircut tailored to your style.' })
        }), 1000));

        if (!response.ok) {
          throw new Error('Failed to fetch service');
        }
        const data = await response.json();
        setService(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

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
        <span className="font-semibold">Descrição:</span> {service.description}
      </p>
      {/* Add a button to book this service or other actions */}
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Agendar Agora
      </button>
    </div>
  );
};

export default ServiceDetail;

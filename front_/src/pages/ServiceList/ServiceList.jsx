import React, { useEffect, useState } from 'react';
import ServiceCard from '../../components/ServiceCard/ServiceCard'; // Assuming ServiceCard exists

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Haircut', price: 25.00, durationMin: 30 },
            { id: 2, name: 'Manicure', price: 30.00, durationMin: 45 },
            { id: 3, name: 'Pedicure', price: 40.00, durationMin: 60 },
          ])
        }), 1000));

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div className="text-center p-4">Carregando serviços...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nossos Serviços</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};

export default ServiceList;

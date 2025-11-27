import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { IconTicket, IconClock, IconCurrencyDollar } from '../../components/Icons';

const PublicServiceListPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/public/services');
        setServices(response.data);
      } catch (err) {
        console.error('Erro ao buscar serviços públicos:', err);
        setError('Erro ao carregar serviços.');
        toast.error('Erro ao carregar serviços.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div className="text-center p-8">Carregando serviços...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-bold text-text text-center mb-8">
          Escolha um Serviço para Agendar
        </h1>

        {services.length === 0 ? (
          <div className="text-center text-text-muted p-8 border border-border rounded-lg">
            <p>Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link 
                to={`/public/services/${service.id}`} 
                key={service.id}
                className="bg-card rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-text group-hover:text-primary transition-colors">
                      {service.name}
                    </h2>
                    <div className="bg-primary/10 text-primary font-semibold rounded-full px-3 py-1 text-sm">
                      {service.provider.name}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-text-muted space-x-6">
                    <div className="flex items-center gap-2">
                      <IconCurrencyDollar size={18} />
                      <span>{service.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconClock size={18} />
                      <span>{service.durationMin} min</span>
                    </div>
                  </div>
                </div>
                <div className="bg-primary/80 text-primary-foreground text-center p-3 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Ver Horários
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicServiceListPage;

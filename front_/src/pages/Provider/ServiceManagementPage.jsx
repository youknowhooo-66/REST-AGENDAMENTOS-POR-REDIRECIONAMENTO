import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import ServiceForm from '../../components/ServiceForm/ServiceForm';
import { IconEdit, IconTrash, IconPlus, IconSearch } from '../../components/Icons';
import Input from '../../components/Form/Input'; // Assuming you have a generic Input component

const ServiceManagementPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const query = searchTerm ? `?search=${searchTerm}` : '';
      const response = await api.get(`/services${query}`);
      setServices(response.data);
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      setError('Erro ao carregar serviços.');
      toast.error('Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchTerm]); // Re-fetch services when searchTerm changes

  const handleCreateService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Tem certeza que deseja deletar este serviço?')) {
      try {
        await api.delete(`/services/${serviceId}`);
        toast.success('Serviço deletado com sucesso!');
        fetchServices();
      } catch (err) {
        console.error('Erro ao deletar serviço:', err);
        toast.error('Erro ao deletar serviço.');
      }
    }
  };

  const handleFormSubmit = async (serviceData) => {
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, serviceData);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await api.post('/services', serviceData);
        toast.success('Serviço criado com sucesso!');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao salvar serviço.';
      toast.error(errorMessage);
    }
  };

  if (loading) return <div className="text-center p-4">Carregando serviços...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text mb-4 sm:mb-0">Gerenciar Serviços</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Buscar serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<IconSearch />}
            className="w-full sm:w-auto"
          />
          <button
            onClick={handleCreateService}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <IconPlus size={20} /> Novo Serviço
          </button>
        </div>
      </div>

      {services.length === 0 && !searchTerm ? (
        <div className="text-center text-text-muted p-8 border border-border rounded-lg">
          <p className="mb-4">Nenhum serviço cadastrado ainda.</p>
          <button
            onClick={handleCreateService}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Criar Primeiro Serviço
          </button>
        </div>
      ) : services.length === 0 && searchTerm ? (
        <div className="text-center text-text-muted p-8 border border-border rounded-lg">
          <p>Nenhum serviço encontrado para "{searchTerm}".</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Preço
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Duração (min)
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    R$ {service.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {service.durationMin} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-primary hover:text-primary/80 mr-3"
                      title="Editar"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="text-destructive hover:text-destructive/80"
                      title="Deletar"
                    >
                      <IconTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ServiceForm
          serviceData={editingService}
          onSubmit={handleFormSubmit}
        />
      </Modal>
    </div>
  );
};

export default ServiceManagementPage;

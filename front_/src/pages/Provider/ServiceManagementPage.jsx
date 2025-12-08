import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import ServiceForm from '../../components/ServiceForm/ServiceForm';
import { IconEdit, IconTrash, IconPlus, IconSearch, IconBriefcase, IconEye } from '../../components/Icons';
import ImageGalleryModal from '../../components/ImageGalleryModal/ImageGalleryModal';
import { formatImageUrl } from '../../utils/imageUtils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/UI/Table';
import EmptyState from '../../components/UI/EmptyState';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Skeleton from '../../components/UI/Skeleton';

const ServiceManagementPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingImages, setViewingImages] = useState(null); // Images being viewed

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
        if (err.response && err.response.status === 409) {
          toast.error('Não é possível deletar este serviço, pois existem agendamentos ou reservas associados a ele.');
        } else {
          toast.error('Erro ao deletar serviço.');
        }
      }
    }
  };

  const handleFormSubmit = async (serviceData) => {
    try {
      if (editingService) {
        const response = await api.put(`/services/${editingService.id}`, serviceData);
        setServices(prevServices =>
          prevServices.map(svc => (svc.id === response.data.id ? response.data : svc))
        );
        toast.success('Serviço atualizado com sucesso!');
      } else {
        const response = await api.post('/services', serviceData);
        setServices(prevServices => [...prevServices, response.data]);
        toast.success('Serviço criado com sucesso!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao salvar serviço.';
      toast.error(errorMessage);
    }
  };

  if (loading) return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    </div>
  );
  if (error) return <div className="text-center p-4 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">Gerenciar Serviços</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Input
            placeholder="Buscar serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<IconSearch className="text-slate-400" />}
            containerClassName="w-full sm:w-64"
          />
          <Button
            onClick={handleCreateService}
            variant="primary"
            icon={<IconPlus size={20} />}
          >
            Novo Serviço
          </Button>
        </div>
      </div>

      {services.length === 0 && !searchTerm ? (
        <EmptyState
          icon={<IconSearch />}
          title="Nenhum serviço cadastrado"
          description="Comece criando seu primeiro serviço para oferecer aos clientes."
          actionLabel="Criar Primeiro Serviço"
          onAction={handleCreateService}
        />
      ) : services.length === 0 && searchTerm ? (
        <EmptyState
          icon={<IconSearch />}
          title="Nenhum serviço encontrado"
          description={`Não encontramos resultados para "${searchTerm}".`}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableHead>Imagem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  {service.imageUrl ? (
                    <img
                      src={formatImageUrl(service.imageUrl)}
                      alt={service.name}
                      className="w-10 h-10 object-cover rounded-full ring-2 ring-slate-100 dark:ring-slate-700"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-service.jpg'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                      <IconBriefcase size={16} />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {service.name}
                </TableCell>
                <TableCell>
                  R$ {(service.priceCents != null ? (service.priceCents / 100) : 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  {service.durationMin != null ? `${(service.durationMin / 60).toFixed(1)} horas` : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {(service.imageUrl || (service.images && service.images.length > 0)) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                        onClick={() => {
                          // Se tiver múltiplas imagens, usar array, senão usar imageUrl
                          const images = service.images && service.images.length > 0 
                            ? service.images 
                            : (service.imageUrl ? [service.imageUrl] : []);
                          setViewingImages(images);
                        }}
                        title="Visualizar Imagens"
                      >
                        <IconEye size={18} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      title="Editar"
                    >
                      <IconEdit size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteService(service.id)}
                      title="Deletar"
                    >
                      <IconTrash size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ServiceForm
          serviceData={editingService}
          onSubmit={handleFormSubmit}
        />
      </Modal>

      <ImageGalleryModal
        isOpen={!!viewingImages && viewingImages.length > 0}
        onClose={() => setViewingImages(null)}
        images={viewingImages || []}
        title="Imagens do Serviço"
      />
    </div>
  );
};

export default ServiceManagementPage;

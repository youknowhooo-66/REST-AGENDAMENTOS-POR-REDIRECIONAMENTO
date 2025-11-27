import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import { IconEdit, IconTrash, IconPlus, IconCalendar, IconClock } from '../../components/Icons';

// AvailabilitySlotForm component for creating/editing slots
const AvailabilitySlotForm = ({ slotData, onSubmit, onClose, staffList, serviceList }) => {
  const [formData, setFormData] = useState({
    serviceId: slotData ? slotData.serviceId : '',
    staffId: slotData ? slotData.staffId : '',
    startAt: slotData ? new Date(slotData.startAt).toISOString().slice(0, 16) : '', // YYYY-MM-DDTHH:MM
    endAt: slotData ? new Date(slotData.endAt).toISOString().slice(0, 16) : '',
  });

  useEffect(() => {
    if (slotData) {
      setFormData({
        serviceId: slotData.serviceId || '',
        staffId: slotData.staffId || '',
        startAt: new Date(slotData.startAt).toISOString().slice(0, 16),
        endAt: new Date(slotData.endAt).toISOString().slice(0, 16),
      });
    }
  }, [slotData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-text">{slotData ? 'Editar Horário' : 'Criar Novo Horário'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="serviceId" className="block text-sm font-medium text-text-muted mb-1">Serviço</label>
          <select
            id="serviceId"
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            className="w-full p-3 border border-border rounded-lg bg-input text-text focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Selecione um serviço</option>
            {serviceList.map(service => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="staffId" className="block text-sm font-medium text-text-muted mb-1">Funcionário (Opcional)</label>
          <select
            id="staffId"
            name="staffId"
            value={formData.staffId}
            onChange={handleChange}
            className="w-full p-3 border border-border rounded-lg bg-input text-text focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Nenhum funcionário</option>
            {staffList.map(staff => (
              <option key={staff.id} value={staff.id}>{staff.name}</option>
            ))}
          </select>
        </div>

        <Input
          label="Início"
          type="datetime-local"
          name="startAt"
          icon={<IconCalendar />}
          value={formData.startAt}
          onChange={handleChange}
          required
        />
        <Input
          label="Fim"
          type="datetime-local"
          name="endAt"
          icon={<IconClock />}
          value={formData.endAt}
          onChange={handleChange}
          required
        />
        
        <Button type="submit" fullWidth>
          {slotData ? 'Atualizar Horário' : 'Criar Horário'}
        </Button>
        <Button type="button" fullWidth variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </form>
    </div>
  );
};


const AvailabilitySlotManagementPage = () => {
  const [slots, setSlots] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // Slot data for editing

  const fetchDependencies = async () => {
    try {
      const [staffRes, serviceRes] = await Promise.all([
        api.get('/staff'),
        api.get('/services')
      ]);
      setStaffList(staffRes.data);
      setServiceList(serviceRes.data);
    } catch (err) {
      console.error('Erro ao buscar dependências:', err);
      toast.error('Erro ao carregar funcionários e serviços.');
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await api.get('/availability-slots');
      setSlots(response.data);
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
      setError('Erro ao carregar horários de disponibilidade.');
      toast.error('Erro ao carregar horários de disponibilidade.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchSlots();
  }, []);

  const handleCreateSlot = () => {
    setEditingSlot(null); // Clear any editing data
    setIsModalOpen(true);
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setIsModalOpen(true);
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm('Tem certeza que deseja deletar este horário de disponibilidade?')) {
      try {
        await api.delete(`/availability-slots/${slotId}`);
        toast.success('Horário deletado com sucesso!');
        fetchSlots(); // Refresh the list
      } catch (err) {
        console.error('Erro ao deletar horário:', err);
        const errorMessage = err.response?.data?.error || 'Erro ao deletar horário.';
        toast.error(errorMessage);
      }
    }
  };

  const handleFormSubmit = async (slotData) => {
    try {
      if (editingSlot) {
        await api.put(`/availability-slots/${editingSlot.id}`, slotData);
        toast.success('Horário atualizado com sucesso!');
      } else {
        await api.post('/availability-slots', slotData);
        toast.success('Horário criado com sucesso!');
      }
      setIsModalOpen(false);
      fetchSlots(); // Refresh the list
    } catch (err) {
      console.error('Erro ao salvar horário:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao salvar horário.';
      toast.error(errorMessage);
    }
  };

  if (loading) return <div className="text-center p-4">Carregando horários...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text">Gerenciar Horários de Disponibilidade</h1>
        <button
          onClick={handleCreateSlot}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <IconPlus size={20} /> Novo Horário
        </button>
      </div>

      {slots.length === 0 ? (
        <div className="text-center text-text-muted p-8 border border-border rounded-lg">
          <p className="mb-4">Nenhum horário de disponibilidade cadastrado ainda.</p>
          <button
            onClick={handleCreateSlot}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Criar Primeiro Horário
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Serviço
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Funcionário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Início
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Fim
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                    {slot.service ? slot.service.name : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {slot.staff ? slot.staff.name : 'Nenhum'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {new Date(slot.startAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {new Date(slot.endAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      slot.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      slot.status === 'BOOKED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {slot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditSlot(slot)}
                      className="text-primary hover:text-primary/80 mr-3"
                      title="Editar"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
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
        <AvailabilitySlotForm
          slotData={editingSlot}
          onSubmit={handleFormSubmit}
          onClose={() => setIsModalOpen(false)}
          staffList={staffList}
          serviceList={serviceList}
        />
      </Modal>
    </div>
  );
};

export default AvailabilitySlotManagementPage;

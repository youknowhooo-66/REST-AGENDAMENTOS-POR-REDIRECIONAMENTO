import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AppointmentTable from '../../components/AppointmentTable/AppointmentTable';
import { toast } from 'react-toastify';
import Input from '../../components/Form/Input'; // Assuming a generic Input component
import { IconFilter } from '../../components/Icons'; // Assuming an IconFilter

const BookingManagementPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterServiceId, setFilterServiceId] = useState('');
  const [filterStaffId, setFilterStaffId] = useState('');
  const [serviceList, setServiceList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const fetchDependencies = async () => {
    try {
      const [serviceRes, staffRes] = await Promise.all([
        api.get('/services'),
        api.get('/staff')
      ]);
      setServiceList(serviceRes.data);
      setStaffList(staffRes.data);
    } catch (err) {
      console.error('Erro ao buscar dependências para filtros:', err);
      toast.error('Erro ao carregar opções de filtro.');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = '';
      if (filterDate) query += `date=${filterDate}&`;
      if (filterServiceId) query += `serviceId=${filterServiceId}&`;
      if (filterStaffId) query += `staffId=${filterStaffId}&`;
      if (query) query = `?${query.slice(0, -1)}`; // Remove trailing '&'

      const response = await api.get(`/bookings/provider${query}`);
      const mappedAppointments = response.data.map(booking => ({
        id: booking.id,
        providerName: booking.user.name,
        serviceName: booking.slot.service.name,
        startTime: booking.slot.startAt,
        endTime: booking.slot.endAt,
        status: booking.status,
      }));
      setAppointments(mappedAppointments);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setError(err.message);
      toast.error('Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []); // Fetch dependencies only once on mount

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterServiceId, filterStaffId]); // Re-fetch appointments when filters change

  const handleClearFilters = () => {
    setFilterDate('');
    setFilterServiceId('');
    setFilterStaffId('');
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Assuming a backend endpoint for provider to cancel a booking by ID
      await api.post(`/bookings/${appointmentId}/provider-cancel`); 
      toast.success('Agendamento cancelado com sucesso!');
      fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao cancelar agendamento.';
      toast.error(errorMessage);
    }
  };

  if (loading) return <div className="text-center p-4">Carregando agendamentos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-text mb-6">Gerenciar Agendamentos</h1>

      {/* Filter Section */}
      <div className="bg-card p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-text mb-3 flex items-center gap-2">
          <IconFilter size={20} /> Filtrar Agendamentos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Data"
            type="date"
            name="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <div>
            <label htmlFor="filterService" className="block text-sm font-medium text-text-muted mb-1">Serviço</label>
            <select
              id="filterService"
              name="filterService"
              value={filterServiceId}
              onChange={(e) => setFilterServiceId(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-input text-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos os Serviços</option>
              {serviceList.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterStaff" className="block text-sm font-medium text-text-muted mb-1">Funcionário</label>
            <select
              id="filterStaff"
              name="filterStaff"
              value={filterStaffId}
              onChange={(e) => setFilterStaffId(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-input text-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos os Funcionários</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
        </div>
      </div>

      <AppointmentTable appointments={appointments} onCancelAppointment={handleCancelAppointment} />
    </div>
  );
};

export default BookingManagementPage;

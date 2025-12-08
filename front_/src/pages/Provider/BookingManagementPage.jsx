import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AppointmentTable from '../../components/AppointmentTable/AppointmentTable';
import { toast } from 'react-toastify';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { IconFilter, IconCalendar, IconUser, IconBriefcase } from '../../components/Icons';

const BookingManagementPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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
      if (query) query = `?${query.slice(0, -1)}`;

      const response = await api.get(`/bookings/provider${query}`);

      const mappedAppointments = Array.isArray(response.data) ? response.data.map(booking => ({
        id: booking.id,
        providerName: booking.user.name,
        serviceName: booking.slot.service.name,
        serviceImageUrl: booking.slot.service.imageUrl,
        staffImageUrl: booking.user.avatarUrl,
        startTime: booking.slot.startAt,
        endTime: booking.slot.endAt,
        status: booking.status,
        user: booking.user
      })) : [];

      setAppointments(mappedAppointments);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      toast.error('Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterServiceId, filterStaffId]);

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
      await api.post(`/bookings/${appointmentId}/cancel`);
      toast.success('Agendamento cancelado com sucesso!');
      fetchAppointments();
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao cancelar agendamento.';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Gerenciar Agendamentos</h1>
          <p className="text-muted-foreground mt-1">Visualize e gerencie os agendamentos dos seus serviços.</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-6 text-card-foreground border-b border-border pb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <IconFilter size={20} />
          </div>
          <h2 className="text-lg font-semibold">Filtros Avançados</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Data do Agendamento"
            type="date"
            name="filterDate"
            icon={IconCalendar}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-background border-border"
          />

          <div className="space-y-1.5">
            <label htmlFor="filterService" className="block text-sm font-semibold text-foreground flex items-center gap-2">
              <IconBriefcase size={16} className="text-primary" />
              Serviço
            </label>
            <select
              id="filterService"
              name="filterService"
              value={filterServiceId}
              onChange={(e) => setFilterServiceId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
            >
              <option value="">Todos os Serviços</option>
              {serviceList.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="filterStaff" className="block text-sm font-semibold text-foreground flex items-center gap-2">
              <IconUser size={16} className="text-primary" />
              Funcionário
            </label>
            <select
              id="filterStaff"
              name="filterStaff"
              value={filterStaffId}
              onChange={(e) => setFilterStaffId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
            >
              <option value="">Todos os Funcionários</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <AppointmentTable
          appointments={appointments}
          onCancelAppointment={handleCancelAppointment}
          isProviderView={true}
        />
      </div>
    </div>
  );
};

export default BookingManagementPage;

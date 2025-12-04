import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AppointmentTable from '../../components/AppointmentTable/AppointmentTable';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const endpoint = user.role === 'PROVIDER' ? '/bookings/provider' : '/bookings';
        const response = await api.get(endpoint);
        
        let mappedAppointments;
        if (user.role === 'PROVIDER') {
          mappedAppointments = response.data.map(booking => ({
            id: booking.id,
            clientName: booking.user.name,
            serviceName: booking.slot.service.name,
            serviceImageUrl: booking.slot.service.imageUrl, // Add service image
            staffName: booking.slot.staff?.name, // Add staff name
            staffImageUrl: booking.slot.staff?.imageUrl, // Add staff image
            startTime: booking.slot.startAt,
            endTime: booking.slot.endAt,
            status: booking.status,
          }));
        } else {
          mappedAppointments = response.data.map(booking => ({
            id: booking.id,
            providerName: booking.slot.provider.name,
            serviceName: booking.slot.service.name,
            serviceImageUrl: booking.slot.service.imageUrl, // Add service image
            startTime: booking.slot.startAt,
            endTime: booking.slot.endAt,
            status: booking.status,
          }));
        }
        setAppointments(mappedAppointments);
      } catch (err) {
        setError(err.message);
        toast.error('Erro ao carregar agendamentos.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await api.post(`/bookings/${appointmentId}/cancel`);
      toast.success('Agendamento cancelado com sucesso!');
      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app.id === appointmentId ? { ...app, status: 'CANCELLED' } : app
        )
      );
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
      <h1 className="text-2xl font-bold mb-4">Lista de Agendamentos</h1>
      <AppointmentTable appointments={appointments} onCancelAppointment={handleCancelAppointment} isProviderView={user.role === 'PROVIDER'} />
    </div>
  );
};

export default AppointmentList;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AppointmentTable from '../../components/AppointmentTable/AppointmentTable';
import { toast } from 'react-toastify';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/bookings');
        // Map the booking data to the format expected by AppointmentTable
        const mappedAppointments = response.data.map(booking => ({
          id: booking.id,
          providerName: booking.slot.provider.name, // Client view: shows the provider's name
          serviceName: booking.slot.service.name,
          startTime: booking.slot.startAt,
          endTime: booking.slot.endAt,
          status: booking.status,
        }));
        setAppointments(mappedAppointments);
      } catch (err) {
        setError(err.message);
        toast.error('Erro ao carregar agendamentos.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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
      <AppointmentTable appointments={appointments} onCancelAppointment={handleCancelAppointment} />
    </div>
  );
};

export default AppointmentList;

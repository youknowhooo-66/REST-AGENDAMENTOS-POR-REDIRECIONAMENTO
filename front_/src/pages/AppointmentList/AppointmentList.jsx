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
          mappedAppointments = response.data.data.map(booking => ({
            id: booking.id,
            clientName: booking.user.name,
            clientAvatarUrl: booking.user.avatarUrl, // Added client's avatarUrl
            serviceName: booking.slot.service.name,
            serviceImageUrl: booking.slot.service.imageUrl,
            staffName: booking.slot.staff?.name,
            staffImageUrl: booking.slot.staff?.imageUrl,
            startTime: booking.slot.startAt,
            endTime: booking.slot.endAt,
            status: booking.status,
          }));
        } else {
          mappedAppointments = response.data.data.map(booking => ({
            id: booking.id,
            providerName: booking.slot.provider.name,
            providerAvatarUrl: booking.slot.provider.avatarUrl, // Added provider's avatarUrl
            serviceName: booking.slot.service.name,
            serviceImageUrl: booking.slot.service.imageUrl,
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

  if (loading) return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6"></div>
      {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>)}
    </div>
  );
  if (error) return <div className="text-center p-4 text-destructive dark:text-red-400 font-medium">Erro: {error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Lista de Agendamentos</h1>
      {appointments.length > 0 ? (
        <AppointmentTable appointments={appointments} onCancelAppointment={handleCancelAppointment} isProviderView={user.role === 'PROVIDER'} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Nenhum agendamento encontrado</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Você ainda não possui agendamentos cadastrados.
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;

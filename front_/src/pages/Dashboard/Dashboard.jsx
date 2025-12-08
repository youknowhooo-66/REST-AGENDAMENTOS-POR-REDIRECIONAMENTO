import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { IconCalendar, IconClock, IconUsers, IconBarChart, IconBriefcase, IconShare } from '../../components/Icons';
import DashboardChart from '../../components/DashboardChart/DashboardChart';
import StatCard from '../../components/Card/StatCard';
import ShareBookingModal from '../../components/ShareBookingModal';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Skeleton from '../../components/UI/Skeleton';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.role === 'PROVIDER') {
        try {
          const [statsResponse, upcomingResponse] = await Promise.all([
            api.get('/dashboard/stats'),
            api.get('/dashboard/upcoming-appointments')
          ]);
          setStats(statsResponse.data);
          setUpcomingAppointments(upcomingResponse.data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          toast.error('Erro ao carregar dados do dashboard.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (user?.role !== 'PROVIDER') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
        <h1 className="text-2xl font-bold text-text mb-4">Acesso Restrito</h1>
        <p>Este painel é exclusivo para usuários com perfil de Provedor.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <p>Não foi possível carregar os dados do dashboard.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Visão Geral do Provedor
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Acompanhe seus agendamentos e estatísticas
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedBooking(null); // Garantir que não é um booking
            setShareModalOpen(true);
          }}
          icon={<IconShare size={20} />}
        >
          Compartilhar Perfil
        </Button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<IconCalendar size={24} className="text-indigo-600 dark:text-indigo-400" />}
          title="Agendamentos Hoje"
          value={stats.bookingsToday}
        />
        <StatCard
          icon={<IconClock size={24} className="text-indigo-600 dark:text-indigo-400" />}
          title="Horários Abertos"
          value={stats.totalOpenSlots}
        />
        <StatCard
          icon={<IconBriefcase size={24} className="text-indigo-600 dark:text-indigo-400" />}
          title="Total de Serviços"
          value={stats.totalServices}
        />
        <StatCard
          icon={<IconUsers size={24} className="text-indigo-600 dark:text-indigo-400" />}
          title="Total de Funcionários"
          value={stats.totalStaff}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section - Bookings by Service */}
        <Card>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <IconBarChart size={22} />
            Agendamentos por Serviço
          </h2>
          <div className="h-80">
            <DashboardChart data={stats.bookingsByService} />
          </div>
        </Card>

        {/* Chart Section - Bookings by Period */}
        <Card>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <IconBarChart size={22} />
            Agendamentos por Período (Últimos 7 Dias)
          </h2>
          <div className="h-80">
            <DashboardChart data={stats.bookingsByPeriod} dataKeyX="date" dataKeyY="bookings" nameKey="Agendamentos" />
          </div>
        </Card>
      </div>

      {/* Upcoming Appointments Section */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <IconCalendar size={22} />
          Próximos Agendamentos
        </h2>
        {upcomingAppointments.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">Nenhum agendamento futuro.</p>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="border border-slate-200 dark:border-slate-700 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 smooth-transition hover-lift">
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white mb-1">{appointment.slot.service.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cliente: {appointment.user.name} ({appointment.user.email})
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Horário: {new Date(appointment.slot.startAt).toLocaleString()} - {new Date(appointment.slot.endAt).toLocaleString()}
                  </p>
                  {appointment.slot.staff && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Profissional: {appointment.slot.staff.name}
                    </p>
                  )}
                </div>
                <div className="mt-2 sm:mt-0">
                  <Badge variant={appointment.status === 'CONFIRMED' ? 'success' : 'warning'}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de Compartilhamento */}
      <ShareBookingModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        booking={selectedBooking}
        customUrl={!selectedBooking ? `${window.location.origin}/scheduling` : null}
        customTitle={!selectedBooking ? 'Meu Perfil de Agendamento' : null}
        customDescription={!selectedBooking ? 'Compartilhe este link para que seus clientes vejam todos os seus serviços disponíveis.' : null}
      />
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { IconCalendar, IconClock, IconUsers, IconBarChart, IconBriefcase, IconArrowRight } from '../../components/Icons';
import DashboardChart from '../../components/DashboardChart/DashboardChart';
import StatCard from '../../components/Card/StatCard';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center h-full">
        <p>Carregando...</p>
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
    <div className="animate-fade-in">
      {/* Header */}
      <h1 className="text-3xl font-bold text-text mb-6">
        Visão Geral do Provedor
      </h1>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<IconCalendar size={24} className="text-primary" />}
          title="Agendamentos Hoje"
          value={stats.bookingsToday}
        />
        <StatCard 
          icon={<IconClock size={24} className="text-primary" />}
          title="Horários Abertos"
          value={stats.totalOpenSlots}
        />
        <StatCard 
          icon={<IconBriefcase size={24} className="text-primary" />}
          title="Total de Serviços"
          value={stats.totalServices}
        />
        <StatCard 
          icon={<IconUsers size={24} className="text-primary" />}
          title="Total de Funcionários"
          value={stats.totalStaff}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section - Bookings by Service */}
        <div className="bg-card p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
            <IconBarChart size={22} />
            Agendamentos por Serviço
          </h2>
          <div className="h-80">
            <DashboardChart data={stats.bookingsByService} />
          </div>
        </div>

        {/* Chart Section - Bookings by Period */}
        <div className="bg-card p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
            <IconBarChart size={22} />
            Agendamentos por Período (Últimos 7 Dias)
          </h2>
          <div className="h-80">
            <DashboardChart data={stats.bookingsByPeriod} dataKeyX="date" dataKeyY="bookings" nameKey="Agendamentos" />
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-card p-6 rounded-xl shadow-md mt-6">
        <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
          <IconCalendar size={22} />
          Próximos Agendamentos
        </h2>
        {upcomingAppointments.length === 0 ? (
          <p className="text-text-muted">Nenhum agendamento futuro.</p>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="border border-border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="font-bold text-text">{appointment.slot.service.name}</p>
                  <p className="text-sm text-text-muted">
                    Cliente: {appointment.user.name} ({appointment.user.email})
                  </p>
                  <p className="text-sm text-text-muted">
                    Horário: {new Date(appointment.slot.startAt).toLocaleString()} - {new Date(appointment.slot.endAt).toLocaleString()}
                  </p>
                  {appointment.slot.staff && (
                    <p className="text-sm text-text-muted">
                      Profissional: {appointment.slot.staff.name}
                    </p>
                  )}
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
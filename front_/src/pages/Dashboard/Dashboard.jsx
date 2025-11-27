import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { IconCalendar, IconClock, IconUsers, IconBarChart, IconBriefcase } from '../../components/Icons';
import DashboardChart from '../../components/DashboardChart/DashboardChart';
import StatCard from '../../components/Card/StatCard';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if the user is a PROVIDER
      if (user && user.role === 'PROVIDER') {
        try {
          const response = await api.get('/dashboard/stats');
          setStats(response.data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          toast.error('Erro ao carregar dados do dashboard.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // Stop loading if user is not a provider
      }
    };

    fetchData();
  }, [user]); // Rerun effect if user changes

  // Still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Carregando...</p>
      </div>
    );
  }

  // If user is not a provider, show access denied message
  if (user?.role !== 'PROVIDER') {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
            <h1 className="text-2xl font-bold text-text mb-4">Acesso Restrito</h1>
            <p>Este painel é exclusivo para usuários com perfil de Provedor.</p>
        </div>
    );
  }

  // If fetching failed for a provider
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
          // change="+5" // Exemplo, se o backend fornecer
          // changeType="positive"
        />
        <StatCard 
          icon={<IconClock size={24} className="text-primary" />}
          title="Horários Abertos"
          value={stats.totalOpenSlots}
          // change="-2" // Exemplo, se o backend fornecer
          // changeType="negative"
        />
        <StatCard 
          icon={<IconBriefcase size={24} className="text-primary" />}
          title="Total de Serviços"
          value={stats.totalServices}
          // change="+10%" // Exemplo, se o backend fornecer
          // changeType="positive"
        />
        <StatCard 
          icon={<IconUsers size={24} className="text-primary" />}
          title="Total de Funcionários"
          value={stats.totalStaff}
          // change="+10%" // Exemplo, se o backend fornecer
          // changeType="positive"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-card p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
          <IconBarChart size={22} />
          Agendamentos por Serviço
        </h2>
        <div className="h-80">
          <DashboardChart data={stats.bookingsByService} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
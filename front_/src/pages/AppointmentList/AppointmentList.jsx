import React, { useEffect, useState } from 'react';
import AppointmentTable from '../../components/AppointmentTable/AppointmentTable';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, clientId: 1, serviceId: 1, startTime: '2025-11-15T10:00:00Z', endTime: '2025-11-15T10:30:00Z', status: 'PENDING', clientName: 'John Doe', serviceName: 'Haircut' },
            { id: 2, clientId: 2, serviceId: 2, startTime: '2025-11-15T11:00:00Z', endTime: '2025-11-15T11:45:00Z', status: 'CONFIRMED', clientName: 'Jane Smith', serviceName: 'Manicure' },
          ])
        }), 1000));

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <div className="text-center p-4">Carregando agendamentos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Agendamentos</h1>
      <AppointmentTable appointments={appointments} />
    </div>
  );
};

export default AppointmentList;

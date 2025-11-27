import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AppointmentDetail = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // TODO: Replace with actual API call to get appointment by ID
        const response = await new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            id: id,
            clientId: 1,
            serviceId: 1,
            startTime: '2025-11-15T10:00:00Z',
            endTime: '2025-11-15T10:30:00Z',
            status: 'PENDING',
            clientName: 'John Doe',
            serviceName: 'Haircut',
          })
        }), 1000));

        if (!response.ok) {
          throw new Error('Failed to fetch appointment');
        }
        const data = await response.json();
        setAppointment(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) return <div className="text-center p-4">Carregando detalhes do agendamento...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;
  if (!appointment) return <div className="text-center p-4">Agendamento não encontrado.</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Detalhes do Agendamento</h1>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">ID do Agendamento:</span> {appointment.id}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Cliente:</span> {appointment.clientName}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Serviço:</span> {appointment.serviceName}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Início:</span> {new Date(appointment.startTime).toLocaleString()}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Fim:</span> {new Date(appointment.endTime).toLocaleString()}
      </p>
      <p className="text-gray-700 mb-4">
        <span className="font-semibold">Status:</span> {appointment.status}
      </p>
      {/* Add buttons for actions like edit, cancel, confirm (if admin) */}
      <div className="flex space-x-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Editar Agendamento
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Cancelar Agendamento
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetail;

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get authenticated user from context
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/appointments/${id}`);
        setAppointment(response.data);
      } catch (err) {
        setError(err.message);
        toast.error('Erro ao carregar detalhes do agendamento.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await api.delete(`/appointments/${id}`);
        toast.success('Agendamento excluído com sucesso!');
        navigate('/appointments'); // Redirect to appointments list after deletion
      } catch (error) {
        toast.error('Erro ao excluir o agendamento.');
        console.error('Error deleting appointment:', error);
      }
    }
  };

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
        <span className="font-semibold">Cliente:</span> {appointment.client ? appointment.client.name : 'N/A'}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Serviço:</span> {appointment.service ? appointment.service.name : 'N/A'}
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
      
      {/* Action Buttons (visible based on user role) */}
      <div className="flex space-x-4">
        {user && (user.role === 'PROVIDER' || user.role === 'ADMIN') && (
          <>
            <Link to={`/appointments/edit/${id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Editar Agendamento
            </Link>
            <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Deletar Agendamento
            </button>
          </>
        )}
        {user && user.role === 'CLIENT' && (
             <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Reagendar
            </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;

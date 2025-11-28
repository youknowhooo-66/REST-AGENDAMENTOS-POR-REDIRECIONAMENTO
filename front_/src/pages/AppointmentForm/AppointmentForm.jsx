import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppointmentFormComponent from '../../components/AppointmentForm/AppointmentForm';
import { toast } from 'react-toastify';

const AppointmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchAppointment = async () => {
        try {
          const response = await api.get(`/appointments/${id}`);
          setAppointment(response.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAppointment();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (appointmentData) => {
    try {
      if (id) {
        await api.put(`/appointments/${id}`, appointmentData);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await api.post('/appointments', appointmentData);
        toast.success('Agendamento criado com sucesso!');
      }
      navigate('/appointments'); // Redirect to appointments list after saving
    } catch (error) {
      toast.error('Erro ao salvar o agendamento.');
      console.error('Error saving appointment:', error);
    }
  };

  if (loading) return <div className="text-center p-4">Carregando...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Editar Agendamento' : 'Agendar Novo Compromisso'}</h1>
      <AppointmentFormComponent onSubmit={handleSubmit} appointmentData={appointment} />
    </div>
  );
};

export default AppointmentFormPage;

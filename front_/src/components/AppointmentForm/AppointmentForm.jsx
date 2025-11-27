import React, { useState, useEffect } from 'react';
import Input from '../Form/Input';
import Button from '../Form/Button';

const AppointmentForm = ({ appointmentData, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    startTime: '',
    endTime: '',
    status: 'PENDING', // Default status
  });

  useEffect(() => {
    if (appointmentData) {
      setFormData({
        clientId: appointmentData.clientId || '',
        serviceId: appointmentData.serviceId || '',
        startTime: appointmentData.startTime ? new Date(appointmentData.startTime).toISOString().slice(0, 16) : '', // Format for datetime-local input
        endTime: appointmentData.endTime ? new Date(appointmentData.endTime).toISOString().slice(0, 16) : '', // Format for datetime-local input
        status: appointmentData.status || 'PENDING',
      });
    }
  }, [appointmentData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{appointmentData ? 'Editar Agendamento' : 'Agendar Novo Compromisso'}</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="ID do Cliente"
          type="number"
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
          required
        />
        <Input
          label="ID do Serviço"
          type="number"
          name="serviceId"
          value={formData.serviceId}
          onChange={handleChange}
          required
        />
        <Input
          label="Hora de Início"
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
        <Input
          label="Hora de Término"
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
        />
        {/* Status can be a dropdown for admin or hidden for client */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="PENDING">Pendente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="COMPLETED">Concluído</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
        <Button type="submit" className="w-full mt-4">
          {appointmentData ? 'Atualizar Agendamento' : 'Agendar Compromisso'}
        </Button>
      </form>
    </div>
  );
};

export default AppointmentForm;

import React from 'react';
import AppointmentFormComponent from '../../components/AppointmentForm/AppointmentForm'; // Renamed to avoid conflict

const AppointmentFormPage = () => {
  const handleSubmit = (appointmentData) => {
    console.log('Appointment data submitted:', appointmentData);
    // TODO: Implement API call to create or update appointment
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Agendar Novo Compromisso</h1>
      <AppointmentFormComponent onSubmit={handleSubmit} />
    </div>
  );
};

export default AppointmentFormPage;

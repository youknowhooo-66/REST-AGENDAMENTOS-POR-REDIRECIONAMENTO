import React from 'react';
import ServiceFormComponent from '../../components/ServiceForm/ServiceForm'; // Renamed to avoid conflict

const ServiceFormPage = () => {
  const handleSubmit = (serviceData) => {
    console.log('Service data submitted:', serviceData);
    // TODO: Implement API call to create or update service
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Criar/Editar Serviço</h1>
      <ServiceFormComponent onSubmit={handleSubmit} />
    </div>
  );
};

export default ServiceFormPage;

import React, { useState, useEffect } from 'react';
import Input from '../Form/Input';
import Button from '../Form/Button';

const ServiceForm = ({ serviceData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationMin: '',
  });

  useEffect(() => {
    if (serviceData) {
      setFormData({
        name: serviceData.name || '',
        price: serviceData.price || '',
        durationMin: serviceData.durationMin || '',
      });
    }
  }, [serviceData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{serviceData ? 'Editar Serviço' : 'Criar Novo Serviço'}</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome do Serviço"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Preço"
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          required
        />
        <Input
          label="Duração (minutos)"
          type="number"
          name="durationMin"
          value={formData.durationMin}
          onChange={handleChange}
          required
        />
        <Button type="submit" className="w-full mt-4">
          {serviceData ? 'Atualizar Serviço' : 'Criar Serviço'}
        </Button>
      </form>
    </div>
  );
};

export default ServiceForm;

import React, { useState, useEffect } from 'react';
import Input from '../Form/Input';
import Button from '../Form/Button';
import { toast } from 'react-toastify';

const ServiceForm = ({ serviceData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationMin: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (serviceData) {
      setFormData({
        name: serviceData.name || '',
        price: serviceData.price.toString() || '', // Ensure price is string for input
        durationMin: serviceData.durationMin.toString() || '', // Ensure duration is string for input
      });
    }
  }, [serviceData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for the field being changed
    if (errors[e.target.name]) {
      setErrors(prevErrors => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) {
      newErrors.name = 'O nome do serviço é obrigatório.';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'O preço deve ser um valor positivo.';
    }
    if (!formData.durationMin || parseInt(formData.durationMin) <= 0) {
      newErrors.durationMin = 'A duração deve ser um número positivo de minutos.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        durationMin: parseInt(formData.durationMin),
      });
    } else {
      toast.error('Por favor, corrija os erros no formulário.');
    }
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
          error={errors.name}
          required
        />
        <Input
          label="Preço"
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          error={errors.price}
          required
        />
        <Input
          label="Duração (minutos)"
          type="number"
          name="durationMin"
          value={formData.durationMin}
          onChange={handleChange}
          error={errors.durationMin}
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

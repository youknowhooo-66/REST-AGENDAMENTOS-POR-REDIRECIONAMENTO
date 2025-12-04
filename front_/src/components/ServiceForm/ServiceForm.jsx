import React, { useState, useEffect } from 'react';
import Input from '../Form/Input';
import Button from '../Form/Button';
import { toast } from 'react-toastify';
import api from '../../services/api'; // Import the API utility

const ServiceForm = ({ serviceData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationMin: '',
    imageUrl: '', // New field for image URL
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false); // New state for upload loading

  useEffect(() => {
    if (serviceData) {
      setFormData({
        name: serviceData.name || '',
        price: serviceData.price.toString() || '',
        durationMin: serviceData.durationMin.toString() || '',
        imageUrl: serviceData.imageUrl || '', // Set existing image URL
      });
    } else {
      setFormData({
        name: '',
        price: '',
        durationMin: '',
        imageUrl: '',
      });
    }
  }, [serviceData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prevErrors => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const response = await api.post('/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
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
    <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{serviceData ? 'Editar Serviço' : 'Criar Novo Serviço'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Image Upload Input */}
        <Input
          label="Imagem do Serviço"
          type="file"
          name="image"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-text-muted mt-1">Carregando imagem...</p>}
        {formData.imageUrl && (
          <div className="my-4">
            <p className="text-sm font-medium text-text mb-1">Preview da Imagem:</p>
            <img src={`http://localhost:3000${formData.imageUrl}`} alt="Preview do Serviço" className="w-32 h-32 object-cover rounded-md" />
          </div>
        )}

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
        <Button type="submit" className="w-full mt-4" disabled={uploading}>
          {serviceData ? 'Atualizar Serviço' : 'Criar Serviço'}
        </Button>
      </form>
    </div>
  );
};

export default ServiceForm;

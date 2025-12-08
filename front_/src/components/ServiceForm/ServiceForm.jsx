import React, { useState, useEffect } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { toast } from 'react-toastify';
import api from '../../services/api'; // Import the API utility
import { formatImageUrl } from '../../utils/imageUtils';

const ServiceForm = ({ serviceData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationMin: '',
    imageUrl: '', // Mantido para compatibilidade
    images: [], // Array de imagens (máximo 10)
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false); // New state for upload loading
  const [uploadingIndex, setUploadingIndex] = useState(null); // Index da imagem sendo carregada

  useEffect(() => {
    if (serviceData) {
      // Se tiver images array, usar ele, senão usar imageUrl como fallback
      const images = serviceData.images && Array.isArray(serviceData.images) 
        ? serviceData.images 
        : (serviceData.imageUrl ? [serviceData.imageUrl] : []);
      
      setFormData({
        name: serviceData.name || '',
        description: serviceData.description || '',
        price: serviceData.priceCents != null ? (serviceData.priceCents / 100).toFixed(2).toString() : '',
        durationMin: serviceData.durationMin != null ? serviceData.durationMin.toString() : '',
        imageUrl: serviceData.imageUrl || '', // Mantido para compatibilidade
        images: images,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        durationMin: '',
        imageUrl: '',
        images: [],
      });
    }
  }, [serviceData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prevErrors => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  const handleFileChange = async (e, index = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Verificar limite de 10 imagens
    const currentImages = formData.images || [];
    if (currentImages.length + files.length > 10) {
      toast.error('Você pode adicionar no máximo 10 imagens.');
      return;
    }

    // Se index for fornecido, está substituindo uma imagem existente
    if (index !== null && index < currentImages.length) {
      const file = files[0];
      setUploadingIndex(index);
      const data = new FormData();
      data.append('file', file);

      try {
        const response = await api.post('/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const newImages = [...currentImages];
        newImages[index] = response.data.url;
        setFormData(prev => ({ 
          ...prev, 
          images: newImages,
          imageUrl: newImages[0] || prev.imageUrl // Primeira imagem como imageUrl para compatibilidade
        }));
        toast.success('Imagem atualizada com sucesso!');
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        toast.error('Erro ao fazer upload da imagem.');
      } finally {
        setUploadingIndex(null);
      }
    } else {
      // Adicionar novas imagens
      setUploading(true);
      const uploadPromises = files.map(file => {
        const data = new FormData();
        data.append('file', file);
        return api.post('/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      });

      try {
        const responses = await Promise.all(uploadPromises);
        const newUrls = responses.map(res => res.data.url);
        setFormData(prev => ({ 
          ...prev, 
          images: [...(prev.images || []), ...newUrls],
          imageUrl: prev.imageUrl || newUrls[0] // Primeira imagem como imageUrl para compatibilidade
        }));
        toast.success(`${newUrls.length} imagem(ns) carregada(s) com sucesso!`);
      } catch (error) {
        console.error('Erro ao fazer upload das imagens:', error);
        toast.error('Erro ao fazer upload das imagens.');
      } finally {
        setUploading(false);
      }
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ 
      ...prev, 
      images: newImages,
      imageUrl: newImages[0] || '' // Primeira imagem como imageUrl para compatibilidade
    }));
    toast.success('Imagem removida!');
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
        images: formData.images || [], // Enviar array de imagens
        imageUrl: formData.images?.[0] || formData.imageUrl || '', // Primeira imagem como imageUrl para compatibilidade
      });
    } else {
      toast.error('Por favor, corrija os erros no formulário.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">{serviceData ? 'Editar Serviço' : 'Criar Novo Serviço'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Multiple Images Upload */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
            Imagens do Serviço {formData.images?.length > 0 && `(${formData.images.length}/10)`}
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading || (formData.images?.length || 0) >= 10}
            className="block w-full text-sm text-slate-500 dark:text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-cyan-50 file:text-cyan-700 dark:file:bg-cyan-900/30 dark:file:text-cyan-300
              hover:file:bg-cyan-100 dark:hover:file:bg-cyan-900/50
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {uploading && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Carregando imagem(ns)...</p>}
          {(formData.images?.length || 0) >= 10 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Limite de 10 imagens atingido.</p>
          )}
          
          {/* Image Gallery */}
          {formData.images && formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {formData.images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={formatImageUrl(imageUrl)} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    title="Remover imagem"
                  >
                    ×
                  </button>
                  {uploadingIndex === index && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Nome do Serviço"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        
        {/* Description Textarea */}
        <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                Descrição do Serviço
            </label>
            <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                    disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
            />
        </div>

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

import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal'; // Assuming a generic Modal component exists
import Input from '../Form/Input';
import Button from '../Form/Button';

const ClientDetailsModal = ({ isOpen, onClose, onSaveDetails, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || '',
        email: initialData.email || '',
        // Password usually shouldn't be pre-filled unless needed, better keep it empty for security or updates
        password: '',
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveDetails(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Seu Perfil">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="Nome Completo"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Nova Senha (Opcional)"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Deixe em branco para manter a atual"
        />
        <Button type="submit" className="w-full mt-4">
          Salvar Detalhes
        </Button>
      </form>
    </Modal>
  );
};

export default ClientDetailsModal;

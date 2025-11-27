import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal'; // Assuming a generic Modal component exists
import Input from '../Form/Input';
import Button from '../Form/Button';

const ClientDetailsModal = ({ isOpen, onClose, onSaveDetails, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        age: initialData.age || '',
      });
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
      <form onSubmit={handleSubmit} className="p-4">
        <Input
          label="Nome Completo"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Número de Telefone"
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <Input
          label="Idade"
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min="1"
          max="120"
          required
        />
        <Button type="submit" className="w-full mt-4">
          Salvar Detalhes
        </Button>
      </form>
    </Modal>
  );
};

export default ClientDetailsModal;

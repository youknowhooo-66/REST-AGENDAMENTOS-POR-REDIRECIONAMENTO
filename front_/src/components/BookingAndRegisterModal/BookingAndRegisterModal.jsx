import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import Input from '../Form/Input';
import Button from '../Form/Button';
import { toast } from 'react-toastify';
import api from '../../services/api';

const BookingAndRegisterModal = ({ isOpen, onClose, slotId, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        slotId: slotId,
      };
      const response = await api.post('/bookings/guest', payload);
      toast.success('Agendamento e registro realizados com sucesso!');
      onBookingSuccess(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao realizar agendamento e registro.';
      toast.error(errorMessage);
      console.error('Error during guest booking and registration:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Agendamento e Criar Conta">
      <form onSubmit={handleSubmit} className="p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Preencha seus dados para confirmar o agendamento. Uma conta será criada para você.
        </p>
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
          label="Número de Telefone"
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <Input
          label="Senha"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
        />
        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? 'Processando...' : 'Confirmar e Criar Conta'}
        </Button>
      </form>
    </Modal>
  );
};

export default BookingAndRegisterModal;

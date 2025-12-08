import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import Input from '../Form/Input';
import Button from '../Form/Button';
import { toast } from 'react-toastify';
import api from '../../services/api';

const BookingAndRegisterModal = ({ isOpen, onClose, slotId, onBookingSuccess, onSwitchToLogin }) => { // Added onSwitchToLogin prop
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '', // New field for password confirmation
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State to manage form errors

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for the field being changed
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Nome Completo é obrigatório.';
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido.';
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros do formulário.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        // Phone is now optional, send only if provided
        phone: formData.phone || null, 
        password: formData.password,
        slotId: slotId,
      };
      const response = await api.post('/public/bookings/guest', payload);
      toast.success('Agendamento e registro realizados com sucesso!');
      onBookingSuccess(response.data);
      onClose(); // Close modal on success
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
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={errors.email}
        />
        <Input
          label="Número de Telefone (Opcional)" // Updated label
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          // Removed required attribute
          error={errors.phone}
        />
        <Input
          label="Senha"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
          error={errors.password}
        />
        <Input
          label="Confirmar Senha" // New confirm password field
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          error={errors.confirmPassword}
        />
        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? 'Processando...' : 'Confirmar e Criar Conta'}
        </Button>
        {onSwitchToLogin && (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full mt-4 text-center text-primary hover:text-primary/80 text-sm"
          >
            Já tem uma conta? Faça login aqui.
          </button>
        )}
      </form>
    </Modal>
  );
};

export default BookingAndRegisterModal;

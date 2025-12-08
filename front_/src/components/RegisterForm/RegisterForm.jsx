import React, { useState, useEffect } from 'react';
import Input from '../Form/Input';
import Button from '../Form/Button';
import { IconUser, IconMail, IconLock, IconPhone } from '../Icons';
import api from '../../services/api'; // Import the API instance
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import { toast } from 'react-toastify'; // Import toast

const RegisterForm = ({ onClose }) => { // Added onClose prop for modal
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CLIENT', // Default role to CLIENT
    referralCode: '', // Add referralCode to formData
  });

  const { login } = useAuth(); // Get login function from AuthContext
  const navigate = useNavigate(); // Get navigate function
  const location = useLocation(); // Get location object

  // Effect to extract referral code from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setFormData(prevFormData => ({
        ...prevFormData,
        referralCode: ref,
      }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/register', formData);

      if (response.status === 201) {
        toast.success('Registro realizado com sucesso! Faça login para continuar.', {
          autoClose: 3000,
          hideProgressBar: true,
          pauseOnHover: false
        });

        // Close modal if onClose is a function
        if (typeof onClose === 'function') {
          onClose();
        }

        navigate('/login');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao registrar usuário.';
      toast.error(errorMessage, {
        autoClose: 3000,
        hideProgressBar: true,
        pauseOnHover: false
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 lg:p-10 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-md">
      <h2 className="text-3xl font-bold text-center mb-6 text-slate-900 dark:text-white">Criar Conta</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="name"
          label="Nome"
          name="name"
          type="text"
          placeholder="Nome completo"
          icon={<IconUser />}
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          id="email-register"
          label="E-mail"
          name="email"
          type="email"
          placeholder="seu@email.com"
          icon={<IconMail />}
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          id="password-register"
          label="Senha"
          name="password"
          type="password"
          placeholder="Senha forte"
          icon={<IconLock />}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          id="phone"
          label="Telefone (opcional)"
          name="phone"
          type="text"
          placeholder="(99) 99999-9999"
          icon={<IconPhone />}
          value={formData.phone}
          onChange={handleChange}
        />
        <div className="flex justify-around">
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="CLIENT"
              checked={formData.role === 'CLIENT'}
              onChange={handleChange}
              className="form-radio h-5 w-5 text-primary"
            />
            <span className="ml-2 text-slate-700 dark:text-slate-300">Cliente</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="PROVIDER"
              checked={formData.role === 'PROVIDER'}
              onChange={handleChange}
              className="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-slate-700 dark:text-slate-300">Provedor</span>
          </label>
        </div>
        <Button type="submit" fullWidth>
          Registrar
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;

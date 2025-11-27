import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Input from '../Form/Input';
import Button from '../Form/Button';
import { IconMail, IconLock, IconUser } from '../Icons';

const RegisterUser = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isPasswordValid = () => password.length >= 8 && password === confirmPassword;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid()) {
      toast.error('As senhas não correspondem ou são muito curtas.');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setIsSaving(false);
      resetForm();
      toast.success("Usuário criado com sucesso! Agora você pode fazer login.", {
        autoClose: 4000,
        hideProgressBar: true,
        pauseOnHover: false
      });
      if (onClose) onClose();

    } catch (error) {
      setIsSaving(false);
      console.error("Erro ao criar o usuário!", error);
      const errorMessage = error.response?.data?.error || 'Erro ao criar usuário!';
      toast.error(errorMessage, {
        autoClose: 3000,
        hideProgressBar: true,
        pauseOnHover: false
      });
    }
  };

  return (
    <div className='w-full max-w-md p-8 bg-card text-card-foreground rounded-xl shadow-2xl'>
        <h2 className='text-3xl font-bold text-center mb-2 text-text'>Criar Conta</h2>
        <p className="text-center text-text-muted mb-8">Junte-se a nós!</p>
        <form onSubmit={handleSubmit} className='space-y-6'>
            <Input 
                id="name"
                label="Nome"
                icon={<IconUser />}
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <Input 
                id="email"
                label="Endereço de e-mail"
                icon={<IconMail />}
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Input 
                id="password"
                label="Senha"
                icon={<IconLock />}
                type="password"
                placeholder="Senha (mín. 8 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <Input 
                id="confirmPassword"
                label="Confirmar Senha"
                icon={<IconLock />}
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <Button type="submit" fullWidth disabled={isSaving || !isPasswordValid() || !name || !email}>
                {isSaving ? 'Salvando...' : 'Criar Conta'}
            </Button>
        </form>
    </div>
  );
};

export default RegisterUser;
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import { IconUser, IconMail, IconLock } from '../../components/Icons';

const ClientProfilePage = () => {
  const { user, login } = useAuth(); // Get user and login function
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    password: '',
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings');
        setBookings(response.data);
      } catch (err) {
        console.error('Erro ao buscar agendamentos:', err);
        toast.error('Erro ao carregar seus agendamentos.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'CLIENT') { // Only fetch bookings if the user is a client
      fetchBookings();
    } else if (user && user.role !== 'CLIENT') {
        // If it's a provider or admin, they shouldn't see "My Bookings" in this context
        setBookings([]); // Ensure bookings list is empty
        setLoading(false); // Stop loading state
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      email: formData.email,
    };
    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      const response = await api.put(`/users/${user.userId}`, updateData);
      toast.success('Perfil atualizado com sucesso!');
      // To update the user's name in the UI, we need to re-login with a new token
      // This is a simplified approach. A better approach would be to have the backend
      // return a new token upon profile update.
      // For now, we will just show a success message.
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar perfil.';
      toast.error(errorMessage);
    }
  };

  if (loading) return <div className="text-center p-8">Carregando perfil...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-text mb-8">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-text mb-6">Informações Pessoais</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <Input
                label="Nome"
                type="text"
                name="name"
                icon={<IconUser />}
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="E-mail"
                type="email"
                name="email"
                icon={<IconMail />}
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Nova Senha (deixe em branco para não alterar)"
                type="password"
                name="password"
                icon={<IconLock />}
                value={formData.password}
                onChange={handleChange}
              />
              <Button type="submit" fullWidth>
                Atualizar Perfil
              </Button>
            </form>
          </div>
        </div>

        {/* Bookings List */}
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-text mb-6">Meus Agendamentos</h2>
            {bookings.length === 0 ? (
              <p className="text-text-muted">Você ainda não tem agendamentos.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="border border-border p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-text">{booking.slot.service.name}</p>
                      <p className="text-sm text-text-muted">
                        {new Date(booking.slot.startAt).toLocaleString()} com {booking.slot.provider.name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import { IconUser, IconMail, IconLock, IconPhone, IconCalendar } from '../../components/Icons'; // Added IconPhone, IconCalendar

const ClientProfilePage = () => {
  const { user, login } = useAuth(); // Get user and login function
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for personal information form
  const [profileFormData, setProfileFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone || '' : '', // Added phone
    age: user ? user.age || '' : '',     // Added age
  });

  // State for password change form
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    // Update profile form data when user context changes
    if (user) {
      setProfileFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
      });
    }

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

  const handleProfileChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordFormData({ ...passwordFormData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const updateData = {
      name: profileFormData.name,
      email: profileFormData.email,
      phone: profileFormData.phone, // Include phone
      age: profileFormData.age ? parseInt(profileFormData.age, 10) : null, // Include age
    };

    try {
      // Assuming the backend returns the updated user data or a new token
      const response = await api.put(`/users/${user.userId}`, updateData);
      toast.success('Perfil atualizado com sucesso!');
      // A more robust solution would be to update the user context after a successful update,
      // possibly by re-fetching user data or having the backend return an updated token.
      // For now, we rely on the toast message.
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar perfil.';
      toast.error(errorMessage);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });
      toast.success('Senha alterada com sucesso!');
      setPasswordFormData({ // Clear form on success
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao alterar senha.';
      toast.error(errorMessage);
    }
  };

  if (loading) return <div className="text-center p-8">Carregando perfil...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-text mb-8">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Information Form */}
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-xl shadow-md mb-8"> {/* Added mb-8 for spacing */}
            <h2 className="text-2xl font-bold text-text mb-6">Informações Pessoais</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <Input
                label="Nome"
                type="text"
                name="name"
                icon={<IconUser />}
                value={profileFormData.name}
                onChange={handleProfileChange}
                required
              />
              <Input
                label="E-mail"
                type="email"
                name="email"
                icon={<IconMail />}
                value={profileFormData.email}
                onChange={handleProfileChange}
                required
              />
              <Input
                label="Telefone"
                type="tel"
                name="phone"
                icon={<IconPhone />}
                value={profileFormData.phone}
                onChange={handleProfileChange}
              />
              <Input
                label="Idade"
                type="number"
                name="age"
                icon={<IconCalendar />}
                value={profileFormData.age}
                onChange={handleProfileChange}
                min="0"
                max="120"
              />
              <Button type="submit" fullWidth>
                Atualizar Perfil
              </Button>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="bg-card p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-text mb-6">Alterar Senha</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Senha Atual"
                type="password"
                name="currentPassword"
                icon={<IconLock />}
                value={passwordFormData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              <Input
                label="Nova Senha"
                type="password"
                name="newPassword"
                icon={<IconLock />}
                value={passwordFormData.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <Input
                label="Confirmar Nova Senha"
                type="password"
                name="confirmNewPassword"
                icon={<IconLock />}
                value={passwordFormData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
              />
              <Button type="submit" fullWidth variant="destructive"> {/* Suggest a destructive variant for password change */}
                Alterar Senha
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
                  <div key={booking.id} className="border border-[var(--border)] p-4 rounded-lg flex justify-between items-center">
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

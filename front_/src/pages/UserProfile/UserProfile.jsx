import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import { IconUser, IconMail, IconLock, IconPhone, IconCalendar } from '../../components/Icons'; // Added IconPhone, IconCalendar

const UserProfile = () => {
    const { user, setUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // New state for phone
    const [age, setAge] = useState('');     // New state for age
    const [theme, setTheme] = useState(''); // New state for theme
    const [avatarUrl, setAvatarUrl] = useState('');
    const [providerName, setProviderName] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false); // Loading for profile update
    const [loadingPassword, setLoadingPassword] = useState(false); // Loading for password change

    // State for password change form
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || ''); // Initialize phone
            setAge(user.age || '');     // Initialize age
            setAvatarUrl(user.avatarUrl || '');
            setTheme(user.theme || 'default'); // Initialize theme, default to 'default'
            if (user.role === 'PROVIDER' && user.provider) {
                setProviderName(user.provider.name || '');
            }
        }
    }, [user]);

    const handleProfileChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handlePasswordFormChange = (e) => {
        setPasswordFormData({ ...passwordFormData, [e.target.name]: e.target.value });
    };


    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setAvatarUrl(response.data.url);
        } catch (error) {
            toast.error('Erro ao fazer upload da imagem.');
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);

        const updatedData = {
            name,
            email,
            phone, // Include phone
            age: age ? parseInt(age, 10) : null, // Include age
            avatarUrl,
            theme, // Include theme
        };

        if (user.role === 'PROVIDER') {
            updatedData.providerName = providerName;
        }

        try {
            // This endpoint `/user/profile` is handled by userController.updateProfile
            const response = await api.put('/user/profile', updatedData);
            setUser(response.data); // Update user context with new data
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            const errorMessage = error.response?.data?.error || 'Erro ao atualizar o perfil.';
            toast.error(errorMessage);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);

        if (passwordFormData.newPassword !== passwordFormData.confirmNewNewPassword) {
            toast.error('A nova senha e a confirmação não coincidem.');
            setLoadingPassword(false);
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
        } finally {
            setLoadingPassword(false);
        }
    };


    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-text mb-8">Meu Perfil</h1>

            <div className="bg-card rounded-3xl shadow-xl p-8 border border-[var(--border)]">
                {/* Profile Information Form */}
                <h2 className="text-2xl font-bold text-text mb-6">Informações Pessoais</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-700 mb-4 overflow-hidden ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:3000${avatarUrl}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <span className="text-4xl font-bold">{name?.charAt(0)?.toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        <div className="w-full max-w-xs">
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                className="text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nome"
                            type="text"
                            value={name}
                            onChange={handleProfileChange(setName)}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={handleProfileChange(setEmail)}
                            required
                        />
                        <Input
                            label="Telefone"
                            type="tel"
                            value={phone}
                            onChange={handleProfileChange(setPhone)}
                            icon={<IconPhone />}
                        />
                        <Input
                            label="Idade"
                            type="number"
                            value={age}
                            onChange={handleProfileChange(setAge)}
                            icon={<IconCalendar />}
                            min="0"
                            max="120"
                        />
                        {user && user.role === 'PROVIDER' && (
                            <Input
                                label="Nome do Provedor"
                                type="text"
                                value={providerName}
                                onChange={handleProfileChange(setProviderName)}
                            />
                        )}
                        <div className="flex flex-col">
                            <label htmlFor="theme-select" className="block text-sm font-medium text-text-light mb-1">Tema</label>
                            <select
                                id="theme-select"
                                value={theme}
                                onChange={handleProfileChange(setTheme)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-background text-text"
                            >
                                <option value="default">Padrão</option>
                                <option value="dark">Escuro</option>
                                <option value="light">Claro</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={loadingProfile} fullWidth>
                            {loadingProfile ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>

                {/* Password Change Form */}
                <div className="mt-10 pt-6 border-t border-[var(--border)]">
                    <h2 className="text-2xl font-bold text-text mb-6">Alterar Senha</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <Input
                            label="Senha Atual"
                            type="password"
                            name="currentPassword"
                            icon={<IconLock />}
                            value={passwordFormData.currentPassword}
                            onChange={handlePasswordFormChange}
                            required
                        />
                        <Input
                            label="Nova Senha"
                            type="password"
                            name="newPassword"
                            icon={<IconLock />}
                            value={passwordFormData.newPassword}
                            onChange={handlePasswordFormChange}
                            required
                        />
                        <Input
                            label="Confirmar Nova Senha"
                            type="password"
                            name="confirmNewPassword"
                            icon={<IconLock />}
                            value={passwordFormData.confirmNewPassword}
                            onChange={handlePasswordFormChange}
                            required
                        />
                        <Button type="submit" fullWidth disabled={loadingPassword} variant="destructive">
                            {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
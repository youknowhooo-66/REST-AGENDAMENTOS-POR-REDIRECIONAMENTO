import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';

const UserProfile = () => {
    const { user, setUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [providerName, setProviderName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setAvatarUrl(user.avatarUrl || '');
            if (user.role === 'PROVIDER' && user.provider) {
                setProviderName(user.provider.name || '');
            }
        }
    }, [user]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedData = {
            name,
            email,
            avatarUrl,
            ...(user.role === 'PROVIDER' && { providerName }),
        };

        try {
            const response = await api.put('/user/profile', updatedData);
            setUser(response.data);
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar o perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Meu Perfil</h1>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <Input
                            label="Nome"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {user && user.role === 'PROVIDER' && (
                            <Input
                                label="Nome do Provedor"
                                type="text"
                                value={providerName}
                                onChange={(e) => setProviderName(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={loading} fullWidth className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <img src={user?.avatarUrl ? `http://localhost:3000${user.avatarUrl}`: ''} alt="Avatar" className="w-24 h-24 rounded-full" />
                </div>
                <Input
                    label="Avatar"
                    type="file"
                    onChange={handleFileChange}
                />
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
                <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                </Button>
            </form>
        </div>
    );
};

export default UserProfile;
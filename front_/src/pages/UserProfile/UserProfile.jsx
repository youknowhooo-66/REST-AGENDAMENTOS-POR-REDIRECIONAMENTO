import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import UserForm from '../../components/UserForm/UserForm';
import { AuthContext } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user: authUser, setUser: setAuthUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser) {
        setLoading(false);
        setError("Usuário não autenticado.");
        return;
      }
      try {
        const response = await api.get(`/users/${authUser.id}`);
        setUser(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authUser]);

  const handleUpdate = async (updatedUserData) => {
    try {
      const response = await api.put(`/users/${authUser.id}`, updatedUserData);
      setUser(response.data);
      setAuthUser(response.data); // Update auth context as well
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div className="text-center p-4">Carregando perfil do usuário...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;
  if (!user) return <div className="text-center p-4">Usuário não encontrado.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Perfil do Usuário: {user.name}</h1>
      <UserForm userData={user} onSubmit={handleUpdate} />
    </div>
  );
};

export default UserProfile;

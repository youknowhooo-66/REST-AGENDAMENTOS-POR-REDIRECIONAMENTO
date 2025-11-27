import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserForm from '../../components/UserForm/UserForm';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // TODO: Replace with actual API call to get user by ID
        const response = await new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ id: id, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', role: 'CLIENT' })
        }), 1000));

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleUpdate = (updatedUserData) => {
    console.log('Updating user:', updatedUserData);
    // TODO: Implement API call to update user
    setUser(updatedUserData); // Optimistic update
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

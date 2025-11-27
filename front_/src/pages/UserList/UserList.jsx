import React, { useEffect, useState } from 'react';
import UserTable from '../../components/UserTable/UserTable';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'CLIENT' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN' },
          ])
        }), 1000));

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="text-center p-4">Carregando usuários...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuários</h1>
      <UserTable users={users} />
    </div>
  );
};

export default UserList;

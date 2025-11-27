import React, { useState, useEffect } from 'react';
import Input from '../Form/Input';
import Button from '../Form/Button';

const UserForm = ({ userData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '', // Assuming role can also be updated, or displayed
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || '',
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{userData ? 'Editar Usuário' : 'Criar Usuário'}</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="E-mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Telefone"
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        {/* Role display/edit - consider if this should be editable by all users or only admins */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Função</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            readOnly={true} // Make it read-only for now, can be changed for admin
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          />
        </div>
        <Button type="submit" className="w-full mt-4">
          {userData ? 'Atualizar Usuário' : 'Criar Usuário'}
        </Button>
      </form>
    </div>
  );
};

export default UserForm;

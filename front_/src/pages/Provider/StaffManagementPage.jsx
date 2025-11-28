import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Form/Input'; // Reusing Input component
import Button from '../../components/Form/Button'; // Reusing Button component
import { IconEdit, IconTrash, IconPlus, IconUser } from '../../components/Icons';

// StaffForm component for creating/editing staff
const StaffForm = ({ staffData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: staffData ? staffData.name : '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (staffData) {
      setFormData({ name: staffData.name || '' });
    }
  }, [staffData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prevErrors => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'O nome do funcionário é obrigatório.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error('Por favor, corrija os erros no formulário.');
    }
  };

  return (
    <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-text">{staffData ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Funcionário"
          type="text"
          name="name"
          icon={<IconUser />}
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <Button type="submit" fullWidth>
          {staffData ? 'Atualizar Funcionário' : 'Adicionar Funcionário'}
        </Button>
        <Button type="button" fullWidth variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </form>
    </div>
  );
};


const StaffManagementPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // Staff data for editing

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      setError('Erro ao carregar funcionários.');
      toast.error('Erro ao carregar funcionários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = () => {
    setEditingStaff(null); // Clear any editing data
    setIsModalOpen(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Tem certeza que deseja deletar este funcionário?')) {
      try {
        await api.delete(`/staff/${staffId}`);
        toast.success('Funcionário deletado com sucesso!');
        fetchStaff(); // Refresh the list
      } catch (err) {
        console.error('Erro ao deletar funcionário:', err);
        const errorMessage = err.response?.data?.error || 'Erro ao deletar funcionário.';
        toast.error(errorMessage);
      }
    }
  };

  const handleFormSubmit = async (staffData) => {
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, staffData);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await api.post('/staff', staffData);
        toast.success('Funcionário adicionado com sucesso!');
      }
      setIsModalOpen(false);
      fetchStaff(); // Refresh the list
    } catch (err) {
      console.error('Erro ao salvar funcionário:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao salvar funcionário.';
      toast.error(errorMessage);
    }
  };

  if (loading) return <div className="text-center p-4">Carregando funcionários...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text">Gerenciar Funcionários</h1>
        <button
          onClick={handleCreateStaff}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <IconPlus size={20} /> Adicionar Funcionário
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="text-center text-text-muted p-8 border border-border rounded-lg">
          <p className="mb-4">Nenhum funcionário cadastrado ainda.</p>
          <button
            onClick={handleCreateStaff}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Adicionar Primeiro Funcionário
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {staff.map((staffMember) => (
                <tr key={staffMember.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                    {staffMember.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditStaff(staffMember)}
                      className="text-primary hover:text-primary/80 mr-3"
                      title="Editar"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staffMember.id)}
                      className="text-destructive hover:text-destructive/80"
                      title="Deletar"
                    >
                      <IconTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <StaffForm
          staffData={editingStaff}
          onSubmit={handleFormSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default StaffManagementPage;

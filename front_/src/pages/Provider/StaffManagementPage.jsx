import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Form/Input'; // Reusing Input component
import Button from '../../components/Form/Button'; // Reusing Button component
import { IconEdit, IconTrash, IconPlus, IconUser, IconEye } from '../../components/Icons';
import ImageModal from '../../components/ImageModal/ImageModal';
import { formatImageUrl } from '../../utils/imageUtils';

// StaffForm component for creating/editing staff
const StaffForm = ({ staffData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '', // New field for image URL
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false); // New state for upload loading

  useEffect(() => {
    if (staffData) {
      setFormData({
        name: staffData.name || '',
        imageUrl: staffData.imageUrl || '', // Set existing image URL
      });
    } else {
      setFormData({ name: '', imageUrl: '' });
    }
  }, [staffData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prevErrors => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const response = await api.post('/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
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
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">{staffData ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload Input */}
        <Input
          label="Imagem do Funcionário"
          type="file"
          name="image"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Carregando imagem...</p>}
        {formData.imageUrl && (
          <div className="my-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Preview da Imagem:</p>
            <img src={formatImageUrl(formData.imageUrl)} alt="Preview do Funcionário" className="w-32 h-32 object-cover rounded-md" />
          </div>
        )}

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
        <Button type="submit" fullWidth disabled={uploading}>
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
  const [viewingImage, setViewingImage] = useState(null); // Image URL being viewed

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

  if (loading) return <div className="text-center p-4 text-slate-600 dark:text-slate-400">Carregando funcionários...</div>;
  if (error) return <div className="text-center p-4 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gerenciar Funcionários</h1>
        <button
          onClick={handleCreateStaff}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md"
        >
          <IconPlus size={20} /> Adicionar Funcionário
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="text-center text-slate-600 dark:text-slate-400 p-8 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
          <p className="mb-4">Nenhum funcionário cadastrado ainda.</p>
          <button
            onClick={handleCreateStaff}
            className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Adicionar Primeiro Funcionário
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Imagem
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {staff.map((staffMember) => (
                <tr key={staffMember.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {staffMember.imageUrl ? (
                        <img 
                          src={formatImageUrl(staffMember.imageUrl)} 
                          alt={staffMember.name} 
                          className="w-12 h-12 object-cover rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <IconUser size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    {staffMember.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {staffMember.imageUrl && (
                        <button
                          onClick={() => setViewingImage(staffMember.imageUrl)}
                          className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300"
                          title="Visualizar Foto"
                        >
                          <IconEye size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditStaff(staffMember)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        title="Editar"
                      >
                        <IconEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staffMember.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        title="Deletar"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
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

      <ImageModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage}
        title="Foto de Perfil do Funcionário"
        alt={staff.find(s => s.imageUrl === viewingImage)?.name || 'Funcionário'}
      />
    </div>
  );
};

export default StaffManagementPage;

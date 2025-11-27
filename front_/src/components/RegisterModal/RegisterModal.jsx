import React from 'react';
import Modal from '../Modal/Modal'; // Assuming a generic Modal component exists
import RegisterForm from '../RegisterForm/RegisterForm';

const RegisterModal = ({ isOpen, onClose, onRegisterSuccess }) => {
  const handleRegister = (formData) => {
    // This function will be called by RegisterForm
    // In a real scenario, you'd make an API call here
    console.log('RegisterModal received data:', formData);
    onRegisterSuccess(formData); // Pass data up to parent
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crie Sua Conta">
      <RegisterForm onSubmit={handleRegister} />
    </Modal>
  );
};

export default RegisterModal;

import React from 'react';
import Modal from '../Modal/Modal'; // Assuming a generic Modal component exists
import ModalLoginForm from './ModalLoginForm'; // Import the new ModalLoginForm

const LoginModal = ({ isOpen, onClose, onLoginSuccess, onSwitchToRegister }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Faça Login">
      <ModalLoginForm
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
        onSwitchToRegister={onSwitchToRegister}
      />
    </Modal>
  );
};

export default LoginModal;

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text">
      <h1 className="text-5xl font-bold mb-4">Bem-vindo ao nosso serviço</h1>
      <p className="text-xl text-text-muted mb-8">A solução completa para gerenciar seus agendamentos.</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-lg font-semibold hover:bg-primary/90 transition">
          Login
        </Link>
        <Link to="/register" className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md text-lg font-semibold hover:bg-secondary/90 transition">
          Registrar
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;

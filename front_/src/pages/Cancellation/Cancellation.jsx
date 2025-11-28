import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { IconCircleCheck, IconAlertTriangle, IconLoader } from '../../components/Icons';

const Cancellation = () => {
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Processando seu cancelamento...');

  useEffect(() => {
    const cancelBooking = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de cancelamento não encontrado na URL.');
        toast.error('Token de cancelamento não encontrado.');
        return;
      }

      try {
        await api.post(`/bookings/cancel-by-token`, { token });
        setStatus('success');
        setMessage('Seu agendamento foi cancelado com sucesso!');
        toast.success('Agendamento cancelado com sucesso!');
      } catch (err) {
        setStatus('error');
        const errorMessage = err.response?.data?.message || 'Erro ao cancelar agendamento. O token pode ser inválido ou ter expirado.';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    cancelBooking();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <IconLoader className="animate-spin text-blue-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Cancelando Agendamento</h2>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <IconCircleCheck className="text-green-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Sucesso!</h2>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <IconAlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Erro</h2>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </>
        )}
        <p className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
          Você pode fechar esta página ou retornar à página inicial.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
        >
          Ir para a Página Inicial
        </button>
      </div>
    </div>
  );
};

export default Cancellation;
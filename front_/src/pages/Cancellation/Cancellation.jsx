import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconCircleCheck, IconAlertTriangle, IconLoader } from '../../components/Icons';
import api from '../../services/api'; // Import the API instance

const Cancellation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle, confirming, confirmed, error
    const [errorMessage, setErrorMessage] = useState('');

    // Automatically start cancellation process if token is present
    useEffect(() => {
        if (token) {
            handleConfirmCancellation();
        } else {
            setStatus('error');
            setErrorMessage('Nenhum token de cancelamento fornecido.');
        }
    }, [token]);

    const handleConfirmCancellation = async () => {
        setStatus('confirming');
        try {
            const response = await api.get(`/bookings/cancel?token=${token}`);
            if (response.status === 200) {
                setStatus('confirmed');
                setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
            }
        } catch (err) {
            console.error('Erro ao cancelar agendamento:', err);
            const message = err.response?.data?.message || 'Não foi possível processar o cancelamento.';
            setErrorMessage(message);
            setStatus('error');
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'confirmed':
                return (
                    <div className="text-center text-green-500 animate-fade-in">
                        <IconCircleCheck size={64} className="mx-auto mb-4" />
                        <h2 className="text-3xl font-bold">Agendamento Cancelado!</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Sua vaga foi liberada. Redirecionando...</p>
                    </div>
                );
            case 'error':
                return (
                    <div className="text-center text-red-500 animate-fade-in">
                        <IconAlertTriangle size={64} className="mx-auto mb-4" />
                        <h2 className="text-3xl font-bold">Erro no Cancelamento</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{errorMessage}</p>
                    </div>
                );
            case 'confirming':
                return (
                    <div className="text-center">
                        <IconLoader size={64} className="mx-auto mb-4 animate-spin text-cyan-500" />
                        <h2 className="text-3xl font-bold">Cancelando...</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Aguarde enquanto processamos sua solicitação.</p>
                    </div>
                );
            case 'idle':
            default:
                // This state is now less likely to be seen by the user due to useEffect
                return (
                    <div className="text-center animate-fade-in">
                        <IconLoader size={64} className="mx-auto mb-4 animate-spin text-cyan-500" />
                        <h2 className="text-3xl font-bold">Processando...</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Validando seu link de cancelamento.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default Cancellation;

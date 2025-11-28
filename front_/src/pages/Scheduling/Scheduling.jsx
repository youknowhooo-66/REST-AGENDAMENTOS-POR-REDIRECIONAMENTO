import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BookingForm from '../../components/BookingForm/BookingForm';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import { IconCircleCheck, IconCalendarX } from '../../components/Icons';
import { toast } from 'react-toastify';
import Button from '../../components/Form/Button';
import RegisterModal from '../../components/RegisterModal/RegisterModal';
import ClientDetailsModal from '../../components/ClientDetailsModal/ClientDetailsModal';
import api from '../../services/api'; // Use the configured API instance

const daysOfWeekMap = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
};

const Scheduling = () => {
    const { serviceId: paramServiceId } = useParams();
    const { isAuthenticated, user, login } = useAuth(); // Destructure login
    const navigate = useNavigate();

    const [selectedService, setSelectedService] = useState(null);
    const [availableSlots, setAvailableSlots] = useState({}); // Stores slots by date
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isBookingConfirmed, setBookingConfirmed] = useState(false);
    const [services, setServices] = useState([]);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tempRegisteredUser, setTempRegisteredUser] = useState(null);

    // --- API Calls ---
    const fetchServiceById = useCallback(async (id) => {
        try {
            const response = await api.get(`/public/services/${id}`);
            return response.data;
        } catch (err) {
            console.error('Error fetching service by ID:', err);
            setError('Falha ao carregar detalhes do serviço.');
            return null;
        }
    }, []);

    const fetchAllServices = useCallback(async () => {
        try {
            const response = await api.get(`/public/services`);
            return response.data;
        } catch (err) {
            console.error('Error fetching all services:', err);
            setError('Falha ao carregar serviços.');
            return null;
        }
    }, []);

    const fetchAvailableSlots = useCallback(async (serviceId, date) => {
        try {
            const response = await api.get(`/public/services/${serviceId}/slots?date=${date}`);
            return response.data;
        } catch (err) {
            console.error('Error fetching available slots:', err);
            setError('Falha ao carregar horários disponíveis.');
            return null;
        }
    }, []);

    const registerUser = async (userData) => {
        try {
            const response = await api.post(`/auth/register`, userData); // Corrected endpoint
            return response.data;
        } catch (err) {
            console.error('Error registering user:', err);
            toast.error(err.response?.data?.error || 'Registration failed.');
            return null;
        }
    };

    const updateUserDetails = async (userId, userData) => {
        try {
            const response = await api.put(`/users/${userId}`, userData);
            return response.data;
        } catch (err) {
            console.error('Error updating user details:', err);
            toast.error(err.response?.data?.error || 'Failed to update profile.');
            return null;
        }
    };

    // --- Effects ---
    useEffect(() => {
        const initializeScheduling = async () => {
            setLoading(true);
            setError(null);

            if (paramServiceId) {
                const service = await fetchServiceById(paramServiceId);
                if (service) {
                    setSelectedService(service);
                    // Fetch slots for today by default
                    const today = new Date().toISOString().slice(0, 10);
                    setSelectedDate(today);
                    const slots = await fetchAvailableSlots(service.id, today);
                    if (slots) {
                        setAvailableSlots({ [today]: slots });
                    }

                    if (!isAuthenticated) {
                        setShowRegisterModal(true);
                    } else if (!user.name || !user.phone) {
                        setShowClientDetailsModal(true);
                    }
                } else {
                    navigate('/scheduling');
                    toast.error('Serviço não encontrado.');
                }
            } else {
                const allServices = await fetchAllServices();
                if (allServices) {
                    setServices(allServices);
                }
            }
            setLoading(false);
        };

        initializeScheduling();
    }, [paramServiceId, isAuthenticated, user, navigate, fetchServiceById, fetchAllServices, fetchAvailableSlots]);

    useEffect(() => {
        if (selectedService && selectedDate) {
            const getSlots = async () => {
                if (!availableSlots[selectedDate]) { // Only fetch if not already in state
                    setLoading(true);
                    const slots = await fetchAvailableSlots(selectedService.id, selectedDate);
                    if (slots) {
                        setAvailableSlots(prev => ({ ...prev, [selectedDate]: slots }));
                    }
                    setLoading(false);
                }
            };
            getSlots();
        }
    }, [selectedService, selectedDate, fetchAvailableSlots, availableSlots]);

    // --- Handlers for Modals ---
    const handleRegisterSuccess = async (formData) => {
        const registered = await registerUser(formData);
        if (registered) {
            setTempRegisteredUser(registered);
            setShowRegisterModal(false);
            setShowClientDetailsModal(true);
            toast.success('Registro bem-sucedido! Por favor, complete seu perfil.');
        }
    };

    const handleSaveClientDetails = async (details) => {
        if (tempRegisteredUser?.id) {
            const updatedUser = await updateUserDetails(tempRegisteredUser.id, details);
            if (updatedUser) {
                // Assuming the update returns the new user data. We need to manually update the token if a new one is issued, or re-login if the context handles token refresh.
                // For now, we assume the backend does NOT return a new token on profile update.
                // If the user context needs refreshing, a full login might be required.
                setShowClientDetailsModal(false);
                toast.success('Perfil atualizado com sucesso! Agora você pode agendar.');
                // Here, you might want to re-fetch the user details to update the context if needed, or simply trust the backend response if it's complete.
            }
        } else if (user?.id) {
            const updatedUser = await updateUserDetails(user.id, details);
            if (updatedUser) {
                // This scenario means an already logged-in user updated their profile.
                // The `login` function from useAuth expects tokens, which `updateUserDetails` doesn't provide.
                // For a proper update, you'd need to re-fetch user data and update AuthContext's user state.
                // For simplicity, we'll just close the modal and rely on a future re-render or explicit refresh if necessary.
                setShowClientDetailsModal(false);
                toast.success('Perfil atualizado com sucesso! Agora você pode agendar.');
            }
        }
    };

    const handleBookingConfirm = async (clientInfo) => {
        if (!selectedSlot) {
            toast.error('Por favor, selecione um horário.');
            return;
        }
        if (!isAuthenticated) {
            toast.error('Você precisa estar logado para agendar.');
            setShowRegisterModal(true);
            return;
        }

        try {
            const bookingData = {
                slotId: selectedSlot.id,
                // Client info might be redundant if user is authenticated and backend uses req.user.userId
                // We'll pass it for now if backend expects it.
                // name: clientInfo.name,
                // email: clientInfo.email,
                // phone: clientInfo.phone,
            };
            await api.post('/bookings', bookingData);
            toast.success('Agendamento realizado com sucesso! Um e-mail de confirmação foi enviado.');
            setBookingConfirmed(true);
            setSelectedSlot(null); // Clear selected slot
            // Optionally refresh slots for the current date to reflect the booking
            const slots = await fetchAvailableSlots(selectedService.id, selectedDate);
            if (slots) {
                setAvailableSlots(prev => ({ ...prev, [selectedDate]: slots }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erro ao realizar agendamento.');
            console.error('Error creating booking:', error);
        }
    };


    if (loading) return <div className="text-center p-4">Carregando...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

    const currentDaySlots = availableSlots[selectedDate] || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-cyan-600 dark:text-cyan-400 mb-4">Agende seu Horário</h1>
                <p className="text-center text-md sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
                    {selectedService ? `Selecione um horário para ${selectedService.name}` : 'Selecione o serviço desejado para agendar.'}
                </p>

                {!selectedService ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => (
                            <ServiceCard 
                                key={service.id} 
                                service={service} 
                                onSelectService={() => setSelectedService(service)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center justify-between">
                            <span>Horários Disponíveis para {selectedService.name}</span>
                            <Button onClick={() => setSelectedService(null)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                                Voltar aos Serviços
                            </Button>
                        </h2>
                        
                        {/* Date Picker */}
                        <div className="mb-6">
                            <label htmlFor="date-select" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                                Selecionar Data:
                            </label>
                            <Input 
                                id="date-select"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full sm:w-auto"
                            />
                        </div>

                        {currentDaySlots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {currentDaySlots.map(slot => (
                                    <button 
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                                            selectedSlot?.id === slot.id ? 'bg-cyan-600 text-white scale-105 shadow-lg' : 'bg-gray-100 dark:bg-gray-700 hover:bg-cyan-100 dark:hover:bg-cyan-900'
                                        }`}
                                    >
                                        {new Date(slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 dark:text-gray-400">Nenhum horário disponível para a data selecionada.</p>
                        )}
                    </div>
                )}

                {selectedSlot && !isBookingConfirmed && (
                    <BookingForm 
                        selectedSlot={selectedSlot}
                        onBookingConfirm={handleBookingConfirm}
                    />
                )}

                {isBookingConfirmed && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg animate-fade-in text-center">
                        <IconCircleCheck className="text-green-500 text-6xl mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Agendamento Confirmado!</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Seu agendamento para {selectedService.name} em {new Date(selectedSlot.startAt).toLocaleString()} foi realizado com sucesso.
                        </p>
                        <Button onClick={() => { setBookingConfirmed(false); setSelectedService(null); setAvailableSlots({}); navigate('/appointments'); }} className="mt-6">
                            Ver Meus Agendamentos
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <RegisterModal 
                isOpen={showRegisterModal} 
                onClose={() => setShowRegisterModal(false)} 
                onRegisterSuccess={handleRegisterSuccess} 
            />
            <ClientDetailsModal 
                isOpen={showClientDetailsModal} 
                onClose={() => setShowClientDetailsModal(false)} 
                onSaveDetails={handleSaveClientDetails} 
                initialData={user || tempRegisteredUser} 
            />
        </div>
    );
};

export default Scheduling;

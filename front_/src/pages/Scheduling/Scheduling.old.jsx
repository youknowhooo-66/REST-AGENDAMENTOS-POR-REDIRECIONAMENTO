import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BookingForm from '../../components/BookingForm/BookingForm';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import { IconCircleCheck, IconCalendarX, IconShare, IconQrCode } from '../../components/Icons';
import { toast } from 'react-toastify';
import Button from '../../components/Form/Button';
import Input from '../../components/Form/Input';
import RegisterModal from '../../components/RegisterModal/RegisterModal';
import ClientDetailsModal from '../../components/ClientDetailsModal/ClientDetailsModal';
import ShareBookingModal from '../../components/ShareBookingModal';
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
    const [searchParams] = useSearchParams();
    const queryServiceId = searchParams.get('serviceId');
    const queryDate = searchParams.get('date');

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
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [createdBooking, setCreatedBooking] = useState(null);

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

            const serviceIdToUse = paramServiceId || queryServiceId;

            if (serviceIdToUse) {
                const service = await fetchServiceById(serviceIdToUse);
                if (service) {
                    setSelectedService(service);

                    // Determine date to use
                    let dateToUse = queryDate;
                    if (!dateToUse) {
                        dateToUse = new Date().toISOString().slice(0, 10);
                    }

                    setSelectedDate(dateToUse);
                    const slots = await fetchAvailableSlots(service.id, dateToUse);
                    if (slots) {
                        setAvailableSlots({ [dateToUse]: slots });
                    }

                    if (!isAuthenticated) {
                        setShowRegisterModal(true);
                    } else if (user && (!user.name || !user.phone)) {
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
    }, [paramServiceId, queryServiceId, queryDate, isAuthenticated, user, navigate, fetchServiceById, fetchAllServices, fetchAvailableSlots]);

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
                setShowClientDetailsModal(false);
                toast.success('Perfil atualizado com sucesso! Agora você pode agendar.');
            }
        } else if (user?.id) {
            const updatedUser = await updateUserDetails(user.id, details);
            if (updatedUser) {
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
            toast.error('Você precisa estar logado para agendar. Por favor, registre-se ou faça login.');
            setShowRegisterModal(true);
            return;
        }

        try {
            const bookingData = {
                slotId: selectedSlot.id,
            };
            const response = await api.post('/bookings', bookingData);
            const newBooking = response.data;

            toast.success('Agendamento realizado com sucesso! Um e-mail de confirmação foi enviado.');
            setBookingConfirmed(true);
            setCreatedBooking(newBooking); // Salvar o booking criado
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
                                        className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 disabled:cursor-not-allowed ${selectedSlot?.id === slot.id ? 'bg-cyan-600 text-white scale-105 shadow-lg' : 'bg-gray-100 dark:bg-gray-700 hover:bg-cyan-100 dark:hover:bg-cyan-900'
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
                    <div className="bg-white dark:bg-card p-8 lg:p-10 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-in">
                        {/* Ícone de Sucesso */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-success-gradient rounded-full flex items-center justify-center animate-pulse-glow">
                                <IconCircleCheck size={48} className="text-white" />
                            </div>
                        </div>

                        {/* Título e Mensagem */}
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                            Agendamento Confirmado!
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-center mb-6 text-lg">
                            Seu agendamento para <span className="font-semibold text-primary">{selectedService.name}</span> foi realizado com sucesso!
                        </p>

                        {/* Detalhes do Agendamento */}
                        {createdBooking && (
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <IconCircleCheck size={20} className="text-success" />
                                    Detalhes do Agendamento
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Data/Hora:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {new Date(createdBooking.slot?.startAt || selectedSlot.startAt).toLocaleString('pt-BR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Serviço:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {selectedService.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Status:</span>
                                        <span className="badge badge-success">
                                            {createdBooking.status || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dica de Confirmação */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Um e-mail de confirmação foi enviado para você com todos os detalhes do agendamento.
                                </p>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {createdBooking && (
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => setShareModalOpen(true)}
                                    icon={<IconShare size={20} />}
                                >
                                    Compartilhar Agendamento
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => {
                                    setBookingConfirmed(false);
                                    setSelectedService(null);
                                    setAvailableSlots({});
                                    navigate('/appointments');
                                }}
                            >
                                Ver Meus Agendamentos
                            </Button>
                        </div>
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
            <ShareBookingModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                booking={createdBooking}
            />
        </div>
    );
};

export default Scheduling;

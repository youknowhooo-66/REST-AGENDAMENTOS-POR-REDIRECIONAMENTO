import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { IconCalendar, IconClock, IconCurrencyDollar, IconUser, IconArrowLeft, IconCheck } from '../../components/Icons';
import Button from '../../components/Form/Button';
import Input from '../../components/Form/Input';

const ClientBookingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Fetch all available services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/public/services');
                setServices(response.data);
            } catch (err) {
                console.error('Erro ao buscar serviços:', err);
                toast.error('Erro ao carregar serviços.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Fetch available slots when a service is selected or date changes
    useEffect(() => {
        if (selectedService) {
            fetchAvailableSlots(selectedService.id, selectedDate);
        }
    }, [selectedService, selectedDate]);

    const fetchAvailableSlots = async (serviceId, date) => {
        setLoadingSlots(true);
        try {
            const response = await api.get(`/public/services/${serviceId}/slots?date=${date}`);
            setAvailableSlots(response.data);
        } catch (err) {
            console.error('Erro ao buscar horários disponíveis:', err);
            toast.error('Erro ao carregar horários disponíveis.');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setSelectedSlot(null);
        setAvailableSlots([]);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
    };

    const handleBooking = async () => {
        if (!selectedSlot) {
            toast.warning('Por favor, selecione um horário.');
            return;
        }

        setBooking(true);
        try {
            await api.post('/bookings', { slotId: selectedSlot.id });
            toast.success('Agendamento realizado com sucesso! Verifique seu e-mail.');
            navigate('/profile');
        } catch (err) {
            console.error('Erro ao criar agendamento:', err);
            const errorMessage = err.response?.data?.message || 'Erro ao criar agendamento.';
            toast.error(errorMessage);
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-600">Carregando serviços...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen page-gradient py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mb-4 transition"
                    >
                        <IconArrowLeft size={20} />
                        Voltar ao Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                        Agendar Serviço
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">
                        Escolha um serviço e selecione o melhor horário para você
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Services List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                Serviços Disponíveis
                            </h2>

                            {services.length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400">Nenhum serviço disponível.</p>
                            ) : (
                                <div className="space-y-3">
                                    {services.map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => handleServiceSelect(service)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${selectedService?.id === service.id
                                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                                                }`}
                                        >
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                                {service.name}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <IconCurrencyDollar size={14} />
                                                    R$ {service.priceCents !== undefined ? (service.priceCents / 100).toFixed(2) : 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <IconClock size={14} />
                                                    {service.durationMin} min
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {service.provider.name}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Available Slots */}
                    <div className="lg:col-span-2">
                        {!selectedService ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center border border-slate-100 dark:border-slate-700">
                                <IconCalendar size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400">
                                    Selecione um serviço para ver os horários disponíveis
                                </h3>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                            Horários Disponíveis
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            {selectedService.name} - {selectedService.provider.name}
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <Input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {loadingSlots ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-600 dark:text-slate-400">Carregando horários...</p>
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="text-center py-12">
                                        <IconClock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Nenhum horário disponível para este serviço em {new Date(selectedDate).toLocaleDateString('pt-BR')}.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                            {availableSlots.map((slot) => {
                                                const startDate = new Date(slot.startAt);
                                                const endDate = new Date(slot.endAt);

                                                return (
                                                    <button
                                                        key={slot.id}
                                                        onClick={() => handleSlotSelect(slot)}
                                                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${selectedSlot?.id === slot.id
                                                            ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                {startDate.toLocaleDateString('pt-BR')}
                                                            </span>
                                                            {selectedSlot?.id === slot.id && (
                                                                <IconCheck size={18} className="text-green-600" />
                                                            )}
                                                        </div>
                                                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                                                            {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            até {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        {slot.staff && (
                                                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                                                <IconUser size={12} />
                                                                {slot.staff.name}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Booking Summary */}
                                        {selectedSlot && selectedService && (<div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-600 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                                Confirmar Agendamento
                                            </h3>
                                            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-6">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">Serviço:</span>
                                                    <span>{selectedService.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">Provedor:</span>
                                                    <span>{selectedService.provider.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">Data:</span>
                                                    <span>{new Date(selectedSlot.startAt).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">Horário:</span>
                                                    <span>
                                                        {new Date(selectedSlot.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} -
                                                        {new Date(selectedSlot.endAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {selectedSlot.staff && (
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Profissional:</span>
                                                        <span>{selectedSlot.staff.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
                                                    <span className="font-bold">Valor:</span>
                                                    <span className="font-bold text-lg">R$ {selectedService.priceCents !== undefined ? (selectedService.priceCents / 100).toFixed(2) : 'N/A'}</span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleBooking}
                                                disabled={booking}
                                                fullWidth
                                                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                                            >
                                                {booking ? 'Processando...' : 'Confirmar Agendamento'}
                                            </Button>
                                        </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientBookingPage;

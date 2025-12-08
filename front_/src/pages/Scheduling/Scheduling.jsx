import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BookingForm from '../../components/BookingForm/BookingForm';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import { IconCircleCheck, IconCalendarX, IconShare, IconQrCode, IconUser } from '../../components/Icons';
import { toast } from 'react-toastify';
import Button from '../../components/Form/Button';
import Input from '../../components/Form/Input';
import RegisterModal from '../../components/RegisterModal/RegisterModal';
import ClientDetailsModal from '../../components/ClientDetailsModal/ClientDetailsModal';
import ShareBookingModal from '../../components/ShareBookingModal';
import BookingAndRegisterModal from '../../components/BookingAndRegisterModal/BookingAndRegisterModal';
import api from '../../services/api';
import { normalizeServiceData, normalizeServicesData } from '../../utils/serviceNormalizer';
import { formatImageUrl } from '../../utils/imageUtils';
import ServiceImageSlider from '../../components/ServiceCard/ServiceImageSlider';

// View mode constants
const VIEW_MODES = {
    GRID: 'grid',
    CAROUSEL: 'carousel',
    LIST: 'list',
};

// Constants
const DAYS_OF_WEEK = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
};

const ERROR_MESSAGES = {
    SERVICE_NOT_FOUND: 'Serviço não encontrado.',
    SLOT_SELECTION_REQUIRED: 'Por favor, selecione um horário.',
    AUTHENTICATION_REQUIRED: 'Você precisa estar logado para agendar. Por favor, registre-se ou faça login.',
    BOOKING_ERROR: 'Erro ao realizar agendamento.',
    FETCH_SERVICE_ERROR: 'Falha ao carregar detalhes do serviço.',
    FETCH_SERVICES_ERROR: 'Falha ao carregar serviços.',
    FETCH_SLOTS_ERROR: 'Falha ao carregar horários disponíveis.',
    REGISTRATION_ERROR: 'Falha ao registrar usuário.',
    UPDATE_PROFILE_ERROR: 'Falha ao atualizar perfil.',
};

const SUCCESS_MESSAGES = {
    REGISTRATION_SUCCESS: 'Registro bem-sucedido! Por favor, complete seu perfil.',
    PROFILE_UPDATE_SUCCESS: 'Perfil atualizado com sucesso! Agora você pode agendar.',
    BOOKING_SUCCESS: 'Agendamento realizado com sucesso! Um e-mail de confirmação foi enviado.',
};

// Custom hook for scheduling data management
const useSchedulingData = () => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [availableStaff, setAvailableStaff] = useState([]);
    const [availableSlots, setAvailableSlots] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterMode, setFilterMode] = useState('service'); // 'service' or 'staff'

    const fetchServiceById = useCallback(async (id) => {
        try {
            const response = await api.get(`/public/services/${id}`);
            return normalizeServiceData(response.data);
        } catch (err) {
            console.error('Error fetching service by ID:', err);
            setError(ERROR_MESSAGES.FETCH_SERVICE_ERROR);
            return null;
        }
    }, []);

    const fetchAllServices = useCallback(async () => {
        try {
            const response = await api.get('/public/services');
            return normalizeServicesData(response.data);
        } catch (err) {
            console.error('Error fetching all services:', err);
            setError(ERROR_MESSAGES.FETCH_SERVICES_ERROR);
            return null;
        }
    }, []);

    const fetchAvailableSlots = useCallback(async (serviceId, date, staffId = null) => {
        try {
            let response;
            if (staffId) {
                // Buscar slots por funcionário
                response = await api.get(`/public/staff/${staffId}/slots?date=${date}`);
            } else {
                // Buscar slots por serviço
                response = await api.get(`/public/services/${serviceId}/slots?date=${date}`);
            }
            console.log(`[DEBUG] Slots fetched for ${date}:`, response.data);
            return response.data || [];
        } catch (err) {
            console.error('Error fetching available slots:', err);
            setError(ERROR_MESSAGES.FETCH_SLOTS_ERROR);
            return [];
        }
    }, []);

    const fetchStaffByService = useCallback(async (serviceId) => {
        try {
            const response = await api.get(`/public/services/${serviceId}/staff`);
            return response.data || [];
        } catch (err) {
            console.error('Error fetching staff by service:', err);
            return [];
        }
    }, []);

    const updateAvailableSlots = useCallback((date, slots) => {
        setAvailableSlots(prev => ({ ...prev, [date]: slots }));
    }, []);

    return {
        services,
        setServices,
        selectedService,
        setSelectedService,
        selectedStaff,
        setSelectedStaff,
        availableStaff,
        setAvailableStaff,
        availableSlots,
        updateAvailableSlots,
        loading,
        setLoading,
        error,
        setError,
        filterMode,
        setFilterMode,
        fetchServiceById,
        fetchAllServices,
        fetchAvailableSlots,
        fetchStaffByService,
    };
};

// Custom hook for user management
const useUserManagement = () => {
    const [tempRegisteredUser, setTempRegisteredUser] = useState(null);

    const registerUser = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (err) {
            console.error('Error registering user:', err);
            const errorMessage = err.response?.data?.error || ERROR_MESSAGES.REGISTRATION_ERROR;
            toast.error(errorMessage);
            return null;
        }
    };

    const updateUserDetails = async (userId, userData) => {
        try {
            const response = await api.put(`/users/${userId}`, userData);
            return response.data;
        } catch (err) {
            console.error('Error updating user details:', err);
            const errorMessage = err.response?.data?.error || ERROR_MESSAGES.UPDATE_PROFILE_ERROR;
            toast.error(errorMessage);
            return null;
        }
    };

    return {
        tempRegisteredUser,
        setTempRegisteredUser,
        registerUser,
        updateUserDetails,
    };
};

// Custom hook for modal management
const useModalState = () => {
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [showBookingAndRegisterModal, setShowBookingAndRegisterModal] = useState(false);

    return {
        showRegisterModal,
        setShowRegisterModal,
        showClientDetailsModal,
        setShowClientDetailsModal,
        shareModalOpen,
        setShareModalOpen,
        showBookingAndRegisterModal,
        setShowBookingAndRegisterModal,
    };
};

// Helper function to get today's date in ISO format
const getTodayISO = () => new Date().toISOString().slice(0, 10);

// Importado de imageUtils

// Helper function to format time
const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper function to format date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Component: Loading State
const LoadingState = () => (
    <div className="text-center p-4">Carregando...</div>
);

// Component: Error State
const ErrorState = ({ error }) => (
    <div className="text-center p-4 text-red-500">Erro: {error}</div>
);

// Component: Filter Section
const FilterSection = ({ searchTerm, onSearchChange, filterMode, onFilterModeChange }) => (
    <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buscar
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <Input
                        type="text"
                        placeholder={filterMode === 'service' ? "Nome do serviço..." : "Nome do profissional..."}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
            </div>
            <div className="w-full md:w-auto flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtrar por:
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                        onClick={() => onFilterModeChange('service')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterMode === 'service'
                            ? 'bg-white dark:bg-gray-600 text-cyan-600 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-cyan-600'
                            }`}
                    >
                        Serviço
                    </button>
                    <button
                        onClick={() => onFilterModeChange('staff')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterMode === 'staff'
                            ? 'bg-white dark:bg-gray-600 text-cyan-600 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-cyan-600'
                            }`}
                    >
                        Profissional
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// Component: View Mode Selector
const ViewModeSelector = ({ currentMode, onModeChange }) => (
    <div className="flex justify-center items-center gap-4 mb-8">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Modo de Visualização:
        </span>
        <div className="inline-flex rounded-lg shadow-sm bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
            <button
                onClick={() => onModeChange(VIEW_MODES.GRID)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${currentMode === VIEW_MODES.GRID
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                title="Visualização em Grade"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            </button>
            <button
                onClick={() => onModeChange(VIEW_MODES.CAROUSEL)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${currentMode === VIEW_MODES.CAROUSEL
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                title="Visualização em Carrossel"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            </button>
            <button
                onClick={() => onModeChange(VIEW_MODES.LIST)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${currentMode === VIEW_MODES.LIST
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                title="Visualização em Lista"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    </div>
);

// Component: Service Grid View
const ServiceGridView = ({ services, onSelectService }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
            <ServiceCard
                key={service.id}
                service={service}
                onSelectService={() => onSelectService(service)}
            />
        ))}
    </div>
);

// Component: Service Carousel View
const ServiceCarouselView = ({ services, onSelectService }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % services.length);
        setImageError(false);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
        setImageError(false);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setImageError(false);
    };

    if (services.length === 0) return null;

    const currentService = services[currentIndex];

    return (
        <div className="relative max-w-5xl mx-auto">
            {/* Main Carousel */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Image / Slider */}
                <div className="relative h-96 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {(currentService.images && currentService.images.length > 0) || currentService.photo ? (
                        <ServiceImageSlider
                            images={currentService.images && currentService.images.length > 0 ? currentService.images : [currentService.photo]}
                            alt={currentService.title || currentService.name}
                            autoPlayInterval={5000}
                            className="h-full"
                        />
                    ) : (
                        <div className="relative h-96 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
                            {/* Animated Background */}
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                            </div>
                            <div className="relative text-center text-white z-10 p-8">
                                <div className="text-9xl font-bold mb-4 opacity-90 drop-shadow-2xl">
                                    {(currentService.title || currentService.name || 'S')[0].toUpperCase()}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                    {/* Image Overlay Info (Restored) */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20 pointer-events-none">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-4xl font-bold mb-2 drop-shadow-lg">
                                    {currentService.title || currentService.name}
                                </h3>
                                {currentService.provider?.name && (
                                    <div className="flex items-center gap-2 text-white/90 mb-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="font-semibold">{currentService.provider.name}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {currentService.price && (
                                    <div className="bg-green-500 px-4 py-2 rounded-lg font-bold text-lg shadow-xl">
                                        R$ {currentService.price}
                                    </div>
                                )}
                                {currentService.duration && (
                                    <div className="bg-cyan-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-xl">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {currentService.duration} min
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                        {currentService.description || 'Serviço de qualidade premium para você.'}
                    </p>
                    <Button onClick={() => onSelectService(currentService)} fullWidth>
                        <span className="flex items-center justify-center gap-2 text-lg">
                            Ver Horários Disponíveis
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Button>
                </div>

                {/* Navigation Arrows */}
                {services.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-4 rounded-full shadow-2xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 z-10"
                            aria-label="Serviço anterior"
                        >
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-4 rounded-full shadow-2xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 z-10"
                            aria-label="Próximo serviço"
                        >
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Dots Indicator */}
            {services.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {services.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-cyan-600 w-8'
                                : 'bg-gray-300 dark:bg-gray-600 w-3 hover:bg-cyan-400'
                                }`}
                            aria-label={`Ir para serviço ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Thumbnails */}
            {services.length > 1 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                    {services.map((service, index) => (
                        <button
                            key={service.id}
                            onClick={() => goToSlide(index)}
                            className={`relative rounded-lg overflow-hidden transition-all duration-200 ${index === currentIndex
                                ? 'ring-4 ring-cyan-600 scale-105 shadow-xl'
                                : 'opacity-60 hover:opacity-100 hover:scale-105'
                                }`}
                        >
                            {service.photo ? (
                                <img
                                    src={service.photo}
                                    alt={service.title || service.name}
                                    className="w-full h-20 object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={`w-full h-20 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center ${service.photo ? 'hidden' : 'flex'}`}>
                                <span className="text-white font-bold text-sm">
                                    {(service.title || service.name || 'S')[0].toUpperCase()}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Component: Service List View
const ServiceListView = ({ services, onSelectService }) => {
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (serviceId) => {
        setImageErrors(prev => ({ ...prev, [serviceId]: true }));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {services.map(service => {
                const hasImageError = imageErrors[service.id];

                return (
                    <div
                        key={service.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
                    >
                        <div className="flex flex-col md:flex-row">
                            {/* Image */}
                            <div className="md:w-80 h-56 md:h-auto overflow-hidden flex-shrink-0 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                {(service.images && service.images.length > 0) || (service.photo && !hasImageError) ? (
                                    <ServiceImageSlider
                                        images={service.images && service.images.length > 0 ? service.images : [service.photo]}
                                        alt={service.title || service.name}
                                        autoPlayInterval={4000}
                                        className="h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center relative overflow-hidden">
                                        {/* Animated circles */}
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-2xl animate-pulse"></div>
                                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-300 rounded-full mix-blend-overlay filter blur-2xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
                                        </div>
                                        <div className="relative text-center text-white z-10">
                                            <div className="text-7xl font-bold mb-2 opacity-90 drop-shadow-2xl">
                                                {(service.title || service.name || 'S')[0].toUpperCase()}
                                            </div>
                                            <div className="text-sm font-semibold opacity-80 px-4">
                                                {service.title || service.name}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Badges on Image */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {service.price && (
                                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-base font-bold shadow-xl backdrop-blur-sm">
                                            R$ {service.price}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between min-h-[250px]">
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                                        {service.title || service.name}
                                    </h3>

                                    {/* Provider Info */}
                                    {service.provider?.name && (
                                        <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <span className="font-semibold text-base">{service.provider.name}</span>
                                        </div>
                                    )}

                                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-4 text-base leading-relaxed">
                                        {service.description || 'Serviço de qualidade premium para você. Agende agora e aproveite a melhor experiência.'}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    {/* Info Badges */}
                                    <div className="flex flex-wrap gap-3">
                                        {service.duration && (
                                            <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 shadow-md">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {service.duration} minutos
                                            </div>
                                        )}
                                        {!service.price && (
                                            <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 shadow-md">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Consultar preço
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={() => onSelectService(service)}
                                        className="whitespace-nowrap group-hover:shadow-xl transition-shadow duration-200 min-w-[180px]"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Ver Horários
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Component: Service Selection (with view mode support)
const ServiceSelection = ({ services, onSelectService, viewMode }) => {
    switch (viewMode) {
        case VIEW_MODES.CAROUSEL:
            return <ServiceCarouselView services={services} onSelectService={onSelectService} />;
        case VIEW_MODES.LIST:
            return <ServiceListView services={services} onSelectService={onSelectService} />;
        case VIEW_MODES.GRID:
        default:
            return <ServiceGridView services={services} onSelectService={onSelectService} />;
    }
};

// Component: Date Selector
const DateSelector = ({ selectedDate, onDateChange }) => {
    const today = new Date().toISOString().split('T')[0];
    const minDate = today;

    return (
        <div className="mb-6">
            <label
                htmlFor="date-select"
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 flex items-center gap-2"
            >
                <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Selecionar Data
            </label>
            <div className="relative">
                <Input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    min={minDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full sm:w-auto text-lg font-semibold py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>
        </div>
    );
};

// Component: Time Slot Grid
const TimeSlotGrid = ({ slots, selectedSlot, onSlotSelect }) => {
    if (slots.length === 0) {
        return (
            <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nenhum horário disponível
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tente selecionar outra data
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {slots.map(slot => {
                const isSelected = selectedSlot?.id === slot.id;
                const slotDate = new Date(slot.startAt);
                const dateStr = slotDate.toLocaleDateString('pt-BR');
                return (
                    <button
                        key={slot.id}
                        onClick={() => onSlotSelect(slot)}
                        className={`group relative p-4 rounded-xl text-center font-semibold transition-all duration-300 transform hover:scale-105 ${isSelected
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-xl scale-105 ring-4 ring-cyan-200 dark:ring-cyan-800'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/20 dark:hover:to-blue-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-md hover:shadow-lg'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            {/* Only show date if it's different from context, but for "All Future" viewing we should show it */}
                            <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                {dateStr}
                            </div>
                            <div className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'}`}>
                                {formatTime(slot.startAt)}
                            </div>
                            {slot.staff && (
                                <div className="flex items-center gap-2 mt-1">
                                    {slot.staff.imageUrl ? (
                                        <img
                                            src={formatImageUrl(slot.staff.imageUrl)}
                                            alt={slot.staff.name}
                                            className={`w-6 h-6 rounded-full object-cover border-2 ${isSelected
                                                ? 'border-white'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) {
                                                    e.target.nextSibling.style.display = 'flex';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected
                                            ? 'bg-white/20 text-white'
                                            : 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300'
                                            }`}>
                                            {slot.staff.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {slot.staff.name}
                                    </span>
                                </div>
                            )}
                        </div>
                        {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// Component: Booking Confirmation Card
const BookingConfirmationCard = ({ booking, selectedService, onShare, onViewAppointments }) => (
    <div className="bg-white dark:bg-card p-8 lg:p-10 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-in">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-success-gradient rounded-full flex items-center justify-center animate-pulse-glow">
                <IconCircleCheck size={48} className="text-white" />
            </div>
        </div>

        {/* Title and Message */}
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center">
            Agendamento Confirmado!
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-6 text-lg">
            Seu agendamento para{' '}
            <span className="font-semibold text-primary">{selectedService.name}</span> foi
            realizado com sucesso!
        </p>

        {/* Booking Details */}
        {booking && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <IconCircleCheck size={20} className="text-success" />
                    Detalhes do Agendamento
                </h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Data/Hora:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {formatDate(booking.slot?.startAt)}
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
                        <span className="badge badge-success">{booking.status || 'PENDING'}</span>
                    </div>
                </div>
            </div>
        )}

        {/* Confirmation Notice */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex gap-3">
                <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    Um e-mail de confirmação foi enviado para você com todos os detalhes do
                    agendamento.
                </p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
            {booking && (
                <Button
                    variant="primary"
                    fullWidth
                    onClick={onShare}
                    icon={<IconShare size={20} />}
                >
                    Compartilhar Agendamento
                </Button>
            )}
            <Button variant="secondary" fullWidth onClick={onViewAppointments}>
                Ver Meus Agendamentos
            </Button>
        </div>
    </div>
);

// Main Component
const Scheduling = () => {
    const { serviceId: paramServiceId } = useParams();
    const [searchParams] = useSearchParams();
    const queryServiceId = searchParams.get('serviceId');
    const queryDate = searchParams.get('date');

    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Custom hooks
    const schedulingData = useSchedulingData();
    const userManagement = useUserManagement();
    const modalState = useModalState();

    // Local state
    const [selectedDate, setSelectedDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isBookingConfirmed, setBookingConfirmed] = useState(false);
    const [createdBooking, setCreatedBooking] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [viewMode, setViewMode] = useState(() => {
        // Load view mode from localStorage or default to grid
        return localStorage.getItem('serviceViewMode') || VIEW_MODES.GRID;
    });

    // Handle view mode change and save to localStorage
    const handleViewModeChange = useCallback((newMode) => {
        setViewMode(newMode);
        localStorage.setItem('serviceViewMode', newMode);
    }, []);

    // Memoized values
    const currentDaySlots = useMemo(
        () => schedulingData.availableSlots[selectedDate] || [],
        [schedulingData.availableSlots, selectedDate]
    );

    const serviceIdToUse = useMemo(
        () => paramServiceId || queryServiceId,
        [paramServiceId, queryServiceId]
    );

    // Check if user needs to complete profile
    const needsProfileCompletion = useMemo(
        () => user && (!user.name || !user.phone),
        [user]
    );

    // Initialize scheduling data
    useEffect(() => {
        const initializeScheduling = async () => {
            schedulingData.setLoading(true);
            schedulingData.setError(null);

            if (serviceIdToUse) {
                const service = await schedulingData.fetchServiceById(serviceIdToUse);

                if (service) {
                    schedulingData.setSelectedService(service);

                    // Determine date to use - default to empty to show all future slots
                    const dateToUse = queryDate || '';
                    setSelectedDate(dateToUse);

                    // Fetch slots for the selected date
                    const slots = await schedulingData.fetchAvailableSlots(service.id, dateToUse);
                    if (slots) {
                        schedulingData.updateAvailableSlots(dateToUse, slots);
                    }

                    // NÃO abrir modais automaticamente - apenas quando o usuário tentar agendar
                    // O usuário pode visualizar os slots sem estar autenticado
                    // Se precisar completar perfil, será solicitado apenas ao tentar agendar
                } else {
                    navigate('/scheduling');
                    toast.error(ERROR_MESSAGES.SERVICE_NOT_FOUND);
                }
            } else {
                const allServices = await schedulingData.fetchAllServices();
                if (allServices) {
                    schedulingData.setServices(allServices);
                    // Reset selected slot and date to allow "all future" view
                    setSelectedDate('');
                }
            }

            schedulingData.setLoading(false);
        };

        initializeScheduling();
    }, [serviceIdToUse, queryDate, isAuthenticated, needsProfileCompletion]);

    // Fetch staff when service is selected
    useEffect(() => {
        if (schedulingData.selectedService && schedulingData.filterMode === 'service') {
            const getStaff = async () => {
                const staff = await schedulingData.fetchStaffByService(schedulingData.selectedService.id);
                schedulingData.setAvailableStaff(staff);
            };
            getStaff();
        }
    }, [schedulingData.selectedService, schedulingData.filterMode]);

    // Fetch slots when date, service, or staff changes
    useEffect(() => {
        // Run if service is selected or staff is selected (depending on mode)
        // We allow selectedDate to be empty (for "All Future" view)
        const canFetch = (schedulingData.selectedService) ||
            (schedulingData.filterMode === 'staff' && schedulingData.selectedStaff);

        if (canFetch) {
            const getSlots = async () => {
                setLoadingSlots(true);
                setSelectedSlot(null); // Reset selected slot when date changes
                try {
                    let slots = [];
                    if (schedulingData.filterMode === 'staff' && schedulingData.selectedStaff) {
                        slots = await schedulingData.fetchAvailableSlots(
                            schedulingData.selectedService?.id || '',
                            selectedDate,
                            schedulingData.selectedStaff.id
                        );
                    } else if (schedulingData.selectedService) {
                        slots = await schedulingData.fetchAvailableSlots(
                            schedulingData.selectedService.id,
                            selectedDate
                        );
                    }
                    if (slots !== null) {
                        schedulingData.updateAvailableSlots(selectedDate, slots);
                        console.log(`[DEBUG] Updated slots for ${selectedDate}:`, slots);
                    }
                } catch (error) {
                    console.error('Error loading slots:', error);
                } finally {
                    setLoadingSlots(false);
                }
            };
            getSlots();
        }
    }, [schedulingData.selectedService, schedulingData.selectedStaff, schedulingData.filterMode, selectedDate]);

    // Handlers
    const handleRegisterSuccess = async (formData) => {
        const registered = await userManagement.registerUser(formData);
        if (registered) {
            userManagement.setTempRegisteredUser(registered);
            modalState.setShowRegisterModal(false);
            modalState.setShowClientDetailsModal(true);
            toast.success(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
        }
    };

    const handleSaveClientDetails = async (details) => {
        const userId = userManagement.tempRegisteredUser?.id || user?.id;

        if (!userId) return;

        const updatedUser = await userManagement.updateUserDetails(userId, details);
        if (updatedUser) {
            modalState.setShowClientDetailsModal(false);
            toast.success(SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS);
        }
    };

    const handleBookingConfirm = async () => {
        if (!selectedSlot) {
            toast.error(ERROR_MESSAGES.SLOT_SELECTION_REQUIRED);
            return;
        }

        if (!isAuthenticated) {
            modalState.setShowBookingAndRegisterModal(true);
            return;
        }

        // If authenticated, check if user needs to complete profile
        if (needsProfileCompletion) {
            modalState.setShowClientDetailsModal(true);
            toast.info('Por favor, complete seu perfil (nome e telefone) antes de agendar.');
            return;
        }

        try {
            const bookingData = { slotId: selectedSlot.id };
            const response = await api.post('/bookings', bookingData);
            const newBooking = response.data;

            toast.success(SUCCESS_MESSAGES.BOOKING_SUCCESS);
            setBookingConfirmed(true);
            setCreatedBooking(newBooking);
            setSelectedSlot(null);
            handleViewAppointments(); // Redirect authenticated user to appointments page

            // Refresh slots to reflect the booking
            const slots = await schedulingData.fetchAvailableSlots(
                schedulingData.selectedService.id,
                selectedDate
            );
            if (slots) {
                schedulingData.updateAvailableSlots(selectedDate, slots);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || ERROR_MESSAGES.BOOKING_ERROR;
            toast.error(errorMessage);
            console.error('Error creating booking:', error);
        }
    };

    const handleViewAppointments = () => {
        setBookingConfirmed(false);
        schedulingData.setSelectedService(null);
        schedulingData.updateAvailableSlots('', {});
        navigate('/appointments');
    };

    // Render loading and error states
    if (schedulingData.loading) return <LoadingState />;
    if (schedulingData.error) return <ErrorState error={schedulingData.error} />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-cyan-600 dark:text-cyan-400 mb-4">
                    Agende seu Horário
                </h1>
                <p className="text-center text-md sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
                    {schedulingData.selectedService
                        ? `Selecione um horário para ${schedulingData.selectedService.name}`
                        : 'Selecione o serviço desejado para agendar.'}
                </p>

                {!schedulingData.selectedService ? (
                    <>
                        <ViewModeSelector
                            currentMode={viewMode}
                            onModeChange={handleViewModeChange}
                        />
                        <ServiceSelection
                            services={schedulingData.services}
                            onSelectService={schedulingData.setSelectedService}
                            viewMode={viewMode}
                        />
                    </>
                ) : (
                    <>
                        {/* Service Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row">
                                {/* Service Image */}
                                <div className="md:w-80 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative">
                                    {(schedulingData.selectedService.images && schedulingData.selectedService.images.length > 0) || schedulingData.selectedService.photo ? (
                                        <ServiceImageSlider
                                            images={schedulingData.selectedService.images && schedulingData.selectedService.images.length > 0 ? schedulingData.selectedService.images : [schedulingData.selectedService.photo]}
                                            alt={schedulingData.selectedService.name}
                                            autoPlayInterval={5000}
                                            className="h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <div className="text-7xl font-bold mb-2 opacity-90">
                                                    {(schedulingData.selectedService.name || 'S')[0].toUpperCase()}
                                                </div>
                                                <div className="text-sm font-semibold opacity-75">
                                                    {schedulingData.selectedService.name}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Service Details */}
                                <div className="flex-1 p-6 sm:p-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                                {schedulingData.selectedService.name}
                                            </h2>
                                            {schedulingData.selectedService.provider?.name && (
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span className="font-semibold">{schedulingData.selectedService.provider.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => schedulingData.setSelectedService(null)}
                                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shrink-0"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Voltar
                                        </Button>
                                    </div>

                                    {schedulingData.selectedService.description && (
                                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                            {schedulingData.selectedService.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 mb-6">
                                        {schedulingData.selectedService.duration && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                                <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                                                    {schedulingData.selectedService.duration} min
                                                </span>
                                            </div>
                                        )}
                                        {schedulingData.selectedService.price && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-semibold text-green-700 dark:text-green-300">
                                                    R$ {schedulingData.selectedService.price}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Mode Selector */}
                        {schedulingData.selectedService && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg mb-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filtrar por:</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                schedulingData.setFilterMode('service');
                                                schedulingData.setSelectedStaff(null);
                                            }}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${schedulingData.filterMode === 'service'
                                                ? 'bg-cyan-600 text-white shadow-md'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            Serviço
                                        </button>
                                        <button
                                            onClick={() => {
                                                schedulingData.setFilterMode('staff');
                                                if (schedulingData.availableStaff.length > 0 && !schedulingData.selectedStaff) {
                                                    schedulingData.setSelectedStaff(schedulingData.availableStaff[0]);
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${schedulingData.filterMode === 'staff'
                                                ? 'bg-cyan-600 text-white shadow-md'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            Funcionário
                                        </button>
                                    </div>
                                </div>

                                {/* Staff Selector */}
                                {schedulingData.filterMode === 'staff' && schedulingData.availableStaff.length > 0 && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Selecione o Funcionário:
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {schedulingData.availableStaff.map((staff) => (
                                                <button
                                                    key={staff.id}
                                                    onClick={() => schedulingData.setSelectedStaff(staff)}
                                                    className={`p-3 rounded-lg border-2 transition-all ${schedulingData.selectedStaff?.id === staff.id
                                                        ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 shadow-md'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        {staff.imageUrl ? (
                                                            <img
                                                                src={formatImageUrl(staff.imageUrl)}
                                                                alt={staff.name}
                                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    if (e.target.nextSibling) {
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                <IconUser size={24} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                                                            {staff.name}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Slots Selection Card */}
                        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Selecione um Horário
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {schedulingData.filterMode === 'staff' && schedulingData.selectedStaff
                                        ? `Horários disponíveis para ${schedulingData.selectedStaff.name}`
                                        : 'Escolha a data e o horário que melhor se adequa à sua agenda'}
                                </p>
                            </div>

                            <DateSelector
                                selectedDate={selectedDate}
                                onDateChange={setSelectedDate}
                            />

                            <div className="mt-6">
                                {loadingSlots ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-gray-600 dark:text-gray-400">Carregando horários disponíveis...</p>
                                    </div>
                                ) : (
                                    <TimeSlotGrid
                                        slots={currentDaySlots}
                                        selectedSlot={selectedSlot}
                                        onSlotSelect={setSelectedSlot}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}

                {selectedSlot && !isBookingConfirmed && (
                    <BookingForm
                        selectedSlot={selectedSlot}
                        onBookingConfirm={handleBookingConfirm}
                    />
                )}

                {isBookingConfirmed && (
                    <BookingConfirmationCard
                        booking={createdBooking}
                        selectedService={schedulingData.selectedService}
                        onShare={() => modalState.setShareModalOpen(true)}
                        onViewAppointments={handleViewAppointments}
                    />
                )}
            </div>

            {/* Modals */}
            <RegisterModal
                isOpen={modalState.showRegisterModal}
                onClose={() => modalState.setShowRegisterModal(false)}
                onRegisterSuccess={handleRegisterSuccess}
            />
            <ClientDetailsModal
                isOpen={modalState.showClientDetailsModal}
                onClose={() => modalState.setShowClientDetailsModal(false)}
                onSaveDetails={handleSaveClientDetails}
                initialData={user || userManagement.tempRegisteredUser}
            />
            <ShareBookingModal
                isOpen={modalState.shareModalOpen}
                onClose={() => modalState.setShareModalOpen(false)}
                booking={createdBooking}
            />
            <BookingAndRegisterModal
                isOpen={modalState.showBookingAndRegisterModal}
                onClose={() => modalState.setShowBookingAndRegisterModal(false)}
                slotId={selectedSlot?.id}
                onBookingSuccess={(bookingData) => {
                    modalState.setShowBookingAndRegisterModal(false);
                    setBookingConfirmed(true);
                    setCreatedBooking(bookingData.booking);
                    navigate('/appointments'); // Redirect guest to appointments page
                }}
            />
        </div>
    );
};

export default Scheduling;

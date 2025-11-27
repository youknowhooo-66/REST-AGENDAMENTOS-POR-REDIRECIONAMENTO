import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BookingForm from '../../components/BookingForm/BookingForm';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import { IconCircleCheck, IconCalendarX } from '../../components/Icons';
import { toast } from 'react-toastify';
import Button from '../../components/Form/Button'; // Added Button import
import RegisterModal from '../../components/RegisterModal/RegisterModal';
import ClientDetailsModal from '../../components/ClientDetailsModal/ClientDetailsModal';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Assuming your backend runs on port 3000

const daysOfWeekMap = {
    'monday': 'Segunda-feira',
    'tuesday': 'Terça-feira',
    'wednesday': 'Quarta-feira',
    'thursday': 'Quinta-feira',
    'friday': 'Sexta-feira',
    'saturday': 'Sábado',
    'sunday': 'Domingo',
};

const Scheduling = () => {
    const { serviceId: paramServiceId } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [selectedService, setSelectedService] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isBookingConfirmed, setBookingConfirmed] = useState(false);
    const [services, setServices] = useState([]); // Initialize as empty array
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tempRegisteredUser, setTempRegisteredUser] = useState(null); // To hold user data after first modal

    // --- API Calls ---
    const fetchServiceById = async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/services/${id}`);
            return response.data;
        } catch (err) {
            console.error('Error fetching service by ID:', err);
            setError('Failed to load service details.');
            return null;
        }
    };

    const fetchAllServices = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/services`);
            return response.data;
        } catch (err) {
            console.error('Error fetching all services:', err);
            setError('Failed to load services.');
            return null;
        }
    };

    const registerUser = async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, userData);
            return response.data;
        } catch (err) {
            console.error('Error registering user:', err);
            toast.error(err.response?.data?.error || 'Registration failed.');
            return null;
        }
    };

    const updateUserDetails = async (userId, userData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
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
                    if (!isAuthenticated) {
                        setShowRegisterModal(true);
                    } else if (!user.name || !user.phone) { // Assuming age is not critical for initial check
                        setShowClientDetailsModal(true);
                    }
                } else {
                    // Service not found, redirect or show error
                    navigate('/schedule'); // Redirect to general scheduling
                    toast.error('Service not found.');
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
    }, [paramServiceId, isAuthenticated, user, navigate]); // Added user and navigate to dependencies

    // --- Handlers for Modals ---
    const handleRegisterSuccess = async (formData) => {
        const registered = await registerUser(formData);
        if (registered) {
            setTempRegisteredUser(registered); // Store registered user data
            setShowRegisterModal(false);
            setShowClientDetailsModal(true); // Proceed to second modal
            // Automatically log in the user after registration for seamless experience
            // This assumes register endpoint returns tokens or we can call login
            // For now, we'll just store temp user and let client details modal update
            // In a real app, you'd get tokens and call login(tokens) here.
            toast.success('Registration successful! Please complete your profile.');
        }
    };

    const handleSaveClientDetails = async (details) => {
        if (tempRegisteredUser?.id) {
            const updatedUser = await updateUserDetails(tempRegisteredUser.id, details);
            if (updatedUser) {
                // Assuming updateUserDetails returns the full user object with tokens
                // If not, you might need to re-fetch user data or log in again
                login(updatedUser.token); // Assuming updatedUser contains a token
                setShowClientDetailsModal(false);
                toast.success('Profile updated successfully! You can now book.');
                // If a service was selected, user can now proceed to book
            }
        } else if (user?.id) { // Case where user was already logged in but profile incomplete
            const updatedUser = await updateUserDetails(user.id, details);
            if (updatedUser) {
                login(updatedUser.token); // Refresh user context
                setShowClientDetailsModal(false);
                toast.success('Profile updated successfully! You can now book.');
            }
        }
    };



    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

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
                                onSelectService={setSelectedService} 
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
                        
                        {/* This schedule rendering logic needs to be adapted for real data */}
                        {/* For now, it assumes service.schedule exists and has day/slots */}
                        {selectedService.schedule && selectedService.schedule.map(sDay => (
                            <div key={sDay.day} className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">{daysOfWeekMap[sDay.day]}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {sDay.slots.map(slot => (
                                        <button 
                                            key={slot.time}
                                            onClick={() => slot.available > 0 && setSelectedSlot({ ...slot, day: sDay.day })}
                                            disabled={slot.available === 0}
                                            className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                                                slot.available > 0
                                                ? (selectedSlot?.time === slot.time && selectedSlot?.day === sDay.day ? 'bg-cyan-600 text-white scale-105 shadow-lg' : 'bg-gray-100 dark:bg-gray-700 hover:bg-cyan-100 dark:hover:bg-cyan-900')
                                                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 line-through flex items-center justify-center gap-2'
                                            }`}
                                        >
                                            {slot.available === 0 && <IconCalendarX />}
                                            {slot.time} ({slot.available}/{slot.capacity})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedSlot && (
                    <BookingForm 
                        selectedSlot={selectedSlot}
                        onBookingConfirm={handleBookingConfirm}
                    />
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
                initialData={user || tempRegisteredUser} // Pre-fill with existing user data if available
            />
        </div>
    );
};

export default Scheduling;

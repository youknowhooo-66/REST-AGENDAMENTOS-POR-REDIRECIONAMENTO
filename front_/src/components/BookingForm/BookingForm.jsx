import React from 'react'; // Removed useState
import { IconUser, IconMail, IconPhone, IconCalendar, IconClock, IconBriefcase } from '../Icons'; // Added IconBriefcase for service info
import Button from '../Form/Button'; // Input, IconUser, IconMail, IconPhone no longer needed

// Helper function to format date and time
const formatSlotDateTime = (slot) => {
    if (!slot || !slot.startAt) return '';

    const start = new Date(slot.startAt);
    const end = new Date(slot.endAt);

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    const formattedDate = start.toLocaleDateString('pt-BR', dateOptions);
    const formattedStartTime = start.toLocaleTimeString('pt-BR', timeOptions);
    const formattedEndTime = end.toLocaleTimeString('pt-BR', timeOptions);

    return { formattedDate, formattedStartTime, formattedEndTime };
};

const BookingForm = ({ selectedSlot, onBookingConfirm }) => {
    // name, email, phone states removed as they are no longer collected here

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation - now only confirms slot selection
        if (!selectedSlot) {
            alert('Nenhum horário selecionado para confirmar.'); // Should ideally be prevented before this form shows
            return;
        }
        // No need to pass name, email, phone from here, as they come from user context or guest registration
        onBookingConfirm();
    };

    const { formattedDate, formattedStartTime, formattedEndTime } = formatSlotDateTime(selectedSlot);

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 md:p-10 rounded-3xl shadow-2xl animate-fade-in-up border border-gray-200 dark:border-gray-700 max-w-lg mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
                    Confirmar Agendamento
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Seu horário está quase pronto! Clique em confirmar.
                </p>
            </div>

            {/* Selected Slot Details */}
            {selectedSlot && (
                <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-2xl mb-8 border border-blue-200 dark:border-blue-800 shadow-inner">
                    <h4 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                        <IconCalendar className="w-6 h-6" /> Detalhes do Horário Selecionado
                    </h4>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                        <li className="flex items-center gap-3">
                            <IconClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold">Data:</span> {formattedDate}
                        </li>
                        <li className="flex items-center gap-3">
                            <IconClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold">Hora:</span> {formattedStartTime} - {formattedEndTime}
                        </li>
                        {selectedSlot.service?.name && (
                            <li className="flex items-center gap-3">
                                <IconBriefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold">Serviço:</span> {selectedSlot.service.name}
                            </li>
                        )}
                        {selectedSlot.staff?.name && (
                            <li className="flex items-center gap-3">
                                <IconUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold">Profissional:</span> {selectedSlot.staff.name}
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Button type="submit" fullWidth className="py-3.5 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200">
                    Confirmar Agendamento
                </Button>
            </form>
        </div>
    );
};

export default BookingForm;


import React, { useState } from 'react';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import Checkbox from '../../components/Form/Checkbox';
import { IconCalendar, IconClock, IconTicket, IconPhoto, IconDescription } from '../../components/Icons';
import { toast } from 'react-toastify';

const daysOfWeek = [
    { id: 'monday', name: 'Segunda-feira' },
    { id: 'tuesday', name: 'Terça-feira' },
    { id: 'wednesday', name: 'Quarta-feira' },
    { id: 'thursday', name: 'Quinta-feira' },
    { id: 'friday', name: 'Sexta-feira' },
    { id: 'saturday', name: 'Sábado' },
    { id: 'sunday', name: 'Domingo' },
];

const AppointmentCreator = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(''); // Placeholder for image URL
    const [selectedDays, setSelectedDays] = useState([]);
    const [timeSlots, setTimeSlots] = useState([{ time: '09:00', capacity: 1 }]); // { time: 'HH:MM', capacity: N }

    const handleDayChange = (dayId) => {
        setSelectedDays(prev => 
            prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
        );
    };

    const handleTimeSlotChange = (index, field, value) => {
        const newTimeSlots = [...timeSlots];
        newTimeSlots[index][field] = value;
        setTimeSlots(newTimeSlots);
    };

    const addTimeSlot = () => {
        setTimeSlots(prev => [...prev, { time: '09:00', capacity: 1 }]);
    };

    const removeTimeSlot = (index) => {
        setTimeSlots(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!title || !description || selectedDays.length === 0 || timeSlots.length === 0) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const newAppointmentType = {
            id: Date.now(), // Unique ID
            title,
            description,
            photo,
            schedule: selectedDays.map(dayId => ({
                day: dayId,
                slots: timeSlots.map(slot => ({
                    time: slot.time,
                    capacity: parseInt(slot.capacity, 10),
                    available: parseInt(slot.capacity, 10), // Initially all available
                }))
            }))
        };

        console.log('New Appointment Type Created:', newAppointmentType);
        toast.success('Novo tipo de agendamento criado com sucesso!');
        
        // Reset form
        setTitle('');
        setDescription('');
        setPhoto('');
        setSelectedDays([]);
        setTimeSlots([{ time: '09:00', capacity: 1 }]);
    };

    return (
        <div className="animate-fade-in p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Criar Novo Tipo de Agendamento
            </h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Informações Básicas</h2>
                        <Input 
                            icon={<IconTicket />}
                            placeholder="Título do Agendamento (ex: Consulta Médica)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <div className="mt-4">
                            <Input 
                                icon={<IconDescription />}
                                placeholder="Descrição Detalhada"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <Input 
                                icon={<IconPhoto />}
                                placeholder="URL da Imagem (Opcional)"
                                value={photo}
                                onChange={(e) => setPhoto(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Days Selection */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Dias Disponíveis</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {daysOfWeek.map(day => (
                                <Checkbox
                                    key={day.id}
                                    label={day.name}
                                    checked={selectedDays.includes(day.id)}
                                    onChange={() => handleDayChange(day.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Time Slots and Capacity */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Horários e Capacidade</h2>
                        {timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-4 mb-3">
                                <Input 
                                    icon={<IconClock />}
                                    type="time"
                                    value={slot.time}
                                    onChange={(e) => handleTimeSlotChange(index, 'time', e.target.value)}
                                    required
                                />
                                <Input 
                                    type="number"
                                    placeholder="Capacidade"
                                    value={slot.capacity}
                                    onChange={(e) => handleTimeSlotChange(index, 'capacity', e.target.value)}
                                    min="1"
                                    required
                                />
                                <Button 
                                    type="button" 
                                    onClick={() => removeTimeSlot(index)} 
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                                >
                                    Remover
                                </Button>
                            </div>
                        ))}
                        <Button type="button" onClick={addTimeSlot} className="bg-green-500 hover:bg-green-600 text-white mt-2">
                            Adicionar Horário
                        </Button>
                    </div>

                    <Button type="submit" fullWidth>
                        Criar Tipo de Agendamento
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AppointmentCreator;

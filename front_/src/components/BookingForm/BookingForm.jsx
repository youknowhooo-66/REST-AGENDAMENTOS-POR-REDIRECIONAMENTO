import React, { useState } from 'react';
import { IconUser, IconMail, IconPhone } from '../Icons';
import Input from '../Form/Input';
import Button from '../Form/Button';

const BookingForm = ({ selectedSlot, onBookingConfirm }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!name || !email) {
            alert('Nome e E-mail são obrigatórios.');
            return;
        }
        onBookingConfirm({ name, email, phone, slot: selectedSlot });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-xl font-bold text-center mb-2 text-gray-800 dark:text-white">
                Confirmar Agendamento
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Você está agendando para as <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedSlot.time}</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    icon={<IconUser />}
                    type="text"
                    placeholder="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <Input 
                    icon={<IconMail />}
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input 
                    icon={<IconPhone />}
                    type="tel"
                    placeholder="Telefone (Opcional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <Button type="submit" fullWidth>
                    Confirmar Agendamento
                </Button>
            </form>
        </div>
    );
};

export default BookingForm;


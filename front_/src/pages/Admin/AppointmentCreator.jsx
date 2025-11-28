import React, { useState } from 'react';
import api from '../../services/api';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import { IconTicket, IconDescription, IconPhoto, IconClock, IconCurrencyDollar } from '../../components/Icons';
import { toast } from 'react-toastify';

const AppointmentCreator = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [durationMin, setDurationMin] = useState('');
    const [photo, setPhoto] = useState(''); // Placeholder for image URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        if (!name || !description || !price || !durationMin) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const newService = {
                name,
                description, // Although description is not in the backend service model, we send it.
                price: parseFloat(price),
                durationMin: parseInt(durationMin)
            };

            await api.post('/services', newService);

            toast.success('Novo serviço criado com sucesso!');
            
            // Reset form
            setName('');
            setDescription('');
            setPrice('');
            setDurationMin('');
            setPhoto('');

        } catch (error) {
            toast.error('Erro ao criar serviço.');
            console.error('Error creating service:', error);
        }
    };

    return (
        <div className="animate-fade-in p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Criar Novo Serviço
            </h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Informações Básicas</h2>
                        <Input 
                            icon={<IconTicket />}
                            placeholder="Nome do Serviço (ex: Consulta Médica)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                                icon={<IconCurrency />}
                                placeholder="Preço"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <Input 
                                icon={<IconClock />}
                                placeholder="Duração (em minutos)"
                                type="number"
                                value={durationMin}
                                onChange={(e) => setDurationMin(e.target.value)}
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

                    <Button type="submit" fullWidth>
                        Criar Serviço
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AppointmentCreator;

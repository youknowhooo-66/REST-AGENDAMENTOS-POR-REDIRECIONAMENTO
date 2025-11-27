import React from 'react';
import Button from '../Form/Button';

const ServiceCard = ({ service, onSelectService }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
            {service.photo && (
                <img 
                    src={service.photo} 
                    alt={service.title} 
                    className="w-full h-48 object-cover" 
                />
            )}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">{service.description}</p>
                <Button onClick={() => onSelectService(service)} fullWidth>
                    Ver Horários
                </Button>
            </div>
        </div>
    );
};

export default ServiceCard;

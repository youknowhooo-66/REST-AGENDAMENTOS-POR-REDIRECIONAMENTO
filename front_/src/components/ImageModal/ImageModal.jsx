import React from 'react';
import Modal from '../Modal/Modal';
import { IconX } from '../Icons';
import { formatImageUrl } from '../../utils/imageUtils';

const ImageModal = ({ isOpen, onClose, imageUrl, title = 'Visualizar Imagem', alt = 'Imagem' }) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="relative w-full max-w-4xl mx-auto">
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                        src={formatImageUrl(imageUrl)}
                        alt={alt}
                        className="w-full h-auto max-h-[80vh] object-contain"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="18"%3EImagem não encontrada%3C/text%3E%3C/svg%3E';
                        }}
                    />
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Fechar"
                >
                    <IconX size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
            </div>
        </Modal>
    );
};

export default ImageModal;


import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { IconX } from '../Icons';
import { formatImageUrl } from '../../utils/imageUtils';

// Simple chevron icons
const IconChevronLeft = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const IconChevronRight = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const ImageGalleryModal = ({ isOpen, onClose, images = [], title = 'Galeria de Imagens' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!isOpen || !images || images.length === 0) return null;

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToImage = (index) => {
        setCurrentIndex(index);
    };

    const currentImage = images[currentIndex];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${title} (${currentIndex + 1}/${images.length})`}>
            <div className="relative w-full max-w-5xl mx-auto">
                {/* Main Image */}
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                    <img
                        src={formatImageUrl(currentImage)}
                        alt={`Imagem ${currentIndex + 1}`}
                        className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="18"%3EImagem não encontrada%3C/text%3E%3C/svg%3E';
                        }}
                    />
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                aria-label="Imagem anterior"
                            >
                                <IconChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                aria-label="Próxima imagem"
                            >
                                <IconChevronRight size={24} className="text-gray-700 dark:text-gray-300" />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentIndex
                                        ? 'border-cyan-600 dark:border-cyan-400 ring-2 ring-cyan-200 dark:ring-cyan-800'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500'
                                }`}
                            >
                                <img
                                    src={formatImageUrl(image)}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23e5e7eb"/%3E%3C/svg%3E';
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                    aria-label="Fechar"
                >
                    <IconX size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
            </div>
        </Modal>
    );
};

export default ImageGalleryModal;


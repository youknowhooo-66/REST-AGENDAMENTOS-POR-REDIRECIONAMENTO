import ServiceImageSlider from './ServiceImageSlider';
import Button from '../Form/Button';

const ServiceCard = ({ service, onSelectService }) => {
    // Check if photo is an SVG data URL (placeholder)
    const isPlaceholder = service.photo?.startsWith('data:image/svg+xml');

    // Determine proper images to show. If we have multiple images in service.images, use them.
    // If not, fall back to service.photo (which might be the single image or placeholder).
    // Note: service.images from normalizer usually contains valid URLs.
    const sliderImages = (service.images && service.images.length > 0) ? service.images : (service.photo && !isPlaceholder ? [service.photo] : []);

    const showSlider = sliderImages.length > 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
            {/* Image Container */}
            <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                {showSlider ? (
                    <ServiceImageSlider
                        images={sliderImages}
                        alt={service.title || service.name}
                        autoPlayInterval={4000}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="text-6xl font-bold mb-2 opacity-90">
                                {(service.title || service.name || 'S')[0].toUpperCase()}
                            </div>
                            <div className="text-sm font-semibold opacity-75 px-4">
                                {service.title || service.name}
                            </div>
                        </div>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                    {service.price && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                            R$ {service.price}
                        </div>
                    )}
                    {service.duration && (
                        <div className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {service.duration} min
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                    {service.title || service.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3 text-sm leading-relaxed">
                    {service.description || 'Serviço de qualidade premium para você.'}
                </p>

                {/* Provider Info */}
                {service.provider?.name && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">{service.provider.name}</span>
                    </div>
                )}

                <Button
                    onClick={() => onSelectService(service)}
                    fullWidth
                    className="group-hover:shadow-lg transition-shadow duration-200"
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
    );
};

export default ServiceCard;

/**
 * Service Data Normalizer
 * Normalizes service data from the API to match frontend expectations
 * and provides fallback images for better UX
 */

import { formatImageUrl } from './imageUtils';

// Generate a beautiful gradient based on service name (deterministic)
export const generateServiceGradient = (serviceName) => {
    if (!serviceName) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Sunset
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Ocean
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Rose
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Peach
        'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // Coral
        'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // Lavender
        'linear-gradient(135deg, #f77062 0%, #fe5196 100%)', // Fire
    ];

    // Use service name to consistently pick a gradient
    const hash = serviceName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
};

// Generate SVG placeholder with service initial
export const generateServicePlaceholder = (serviceName, description) => {
    const gradient = generateServiceGradient(serviceName);
    const initial = serviceName ? serviceName[0].toUpperCase() : 'S';

    return `data:image/svg+xml,${encodeURIComponent(`
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:rgb(102,126,234);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgb(118,75,162);stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#grad)"/>
            <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" opacity="0.9">${initial}</text>
            <text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="white" opacity="0.8">${serviceName || 'Serviço'}</text>
        </svg>
    `)}`;
};

/**
 * Normalizes service data from API format to frontend format
 * @param {Object} service - Service object from API
 * @returns {Object} - Normalized service object
 */
export const normalizeServiceData = (service) => {
    if (!service) return null;

    // Processar imagens - pode ser array ou string JSON
    let images = [];
    if (service.images) {
        if (Array.isArray(service.images)) {
            images = service.images;
        } else if (typeof service.images === 'string') {
            try {
                images = JSON.parse(service.images);
            } catch (e) {
                images = [];
            }
        }
    }
    
    // Se não tiver images mas tiver imageUrl, usar imageUrl
    if (images.length === 0 && service.imageUrl) {
        images = [service.imageUrl];
    }

    // Formatar URLs das imagens
    const formattedImages = images.map(formatImageUrl).filter(Boolean);

    // Primeira imagem como photo para compatibilidade
    const photo = formattedImages.length > 0 
        ? formattedImages[0] 
        : (service.imageUrl ? formatImageUrl(service.imageUrl) : generateServicePlaceholder(service.name, service.description));

    return {
        id: service.id,
        title: service.name, // Normalize name to title
        name: service.name,
        description: service.description || 'Serviço de qualidade premium',
        price: service.priceCents ? (service.priceCents / 100).toFixed(2) : null, // Convert cents to reais
        priceCents: service.priceCents,
        duration: service.durationMin, // Normalize durationMin to duration
        durationMin: service.durationMin,
        photo: photo,
        imageUrl: service.imageUrl ? formatImageUrl(service.imageUrl) : null,
        images: formattedImages, // Array de imagens formatadas
        provider: service.provider,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        // Keep original for reference
        _original: service,
    };
};

/**
 * Normalizes an array of services
 * @param {Array} services - Array of service objects from API
 * @returns {Array} - Array of normalized service objects
 */
export const normalizeServicesData = (services) => {
    if (!Array.isArray(services)) return [];
    return services.map(normalizeServiceData);
};

/**
 * Formats price for display
 * @param {number} priceCents - Price in cents
 * @param {string} currency - Currency symbol (default: R$)
 * @returns {string} - Formatted price string
 */
export const formatPrice = (priceCents, currency = 'R$') => {
    if (priceCents === null || priceCents === undefined) return 'Preço sob consulta';
    const price = (priceCents / 100).toFixed(2);
    return `${currency} ${price}`;
};

/**
 * Formats duration for display
 * @param {number} durationMin - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (durationMin) => {
    if (!durationMin) return '';

    if (durationMin < 60) {
        return `${durationMin} min`;
    }

    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}min`;
};

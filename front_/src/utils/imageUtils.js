/**
 * Utilitários para formatação de URLs de imagens
 */

// URL base da API - usar variável de ambiente ou padrão
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Formata URL de imagem para exibição
 * @param {string} url - URL da imagem (pode ser relativa, absoluta ou data URI)
 * @returns {string} - URL formatada
 */
export const formatImageUrl = (url) => {
    if (!url) {
        console.warn('⚠️ formatImageUrl: URL vazia ou nula');
        return null;
    }
    
    // Se já é uma URL absoluta ou data URI, retornar como está
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    
    // Se começa com /, adicionar base URL
    if (url.startsWith('/')) {
        const formatted = `${API_BASE_URL}${url}`;
        console.log('🔗 formatImageUrl:', url, '→', formatted);
        return formatted;
    }
    
    // Caso contrário, adicionar /uploads/ e base URL
    const formatted = `${API_BASE_URL}/uploads/${url}`;
    console.log('🔗 formatImageUrl:', url, '→', formatted);
    return formatted;
};

/**
 * Formata múltiplas URLs de imagens
 * @param {Array<string>} urls - Array de URLs
 * @returns {Array<string>} - Array de URLs formatadas
 */
export const formatImageUrls = (urls) => {
    if (!Array.isArray(urls)) return [];
    return urls.map(formatImageUrl).filter(Boolean);
};

export default formatImageUrl;


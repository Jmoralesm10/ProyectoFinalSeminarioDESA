// =====================================================
// Configuración de la API
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    REGISTER: '/api/users/register',
    LOGIN: '/api/users/login',
    VERIFY_EMAIL: '/api/users/verify-email',
    FORGOT_PASSWORD: '/api/users/forgot-password',
    RESET_PASSWORD: '/api/users/reset-password',
    PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password'
  }
};

// Función helper para construir URLs completas
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// URLs completas para uso directo
export const API_URLS = {
  REGISTER: getApiUrl(API_CONFIG.ENDPOINTS.REGISTER),
  LOGIN: getApiUrl(API_CONFIG.ENDPOINTS.LOGIN),
  VERIFY_EMAIL: getApiUrl(API_CONFIG.ENDPOINTS.VERIFY_EMAIL),
  FORGOT_PASSWORD: getApiUrl(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD),
  RESET_PASSWORD: getApiUrl(API_CONFIG.ENDPOINTS.RESET_PASSWORD),
  PROFILE: getApiUrl(API_CONFIG.ENDPOINTS.PROFILE),
  CHANGE_PASSWORD: getApiUrl(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD)
};

export default API_CONFIG;

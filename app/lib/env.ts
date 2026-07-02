/**
 * Configuración centralizada de variables de entorno
 * Este archivo mapea todas las variables .env del proyecto
 */

// ==================== BACKEND ====================
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:2300';
export const BACKEND_API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY || process.env.NEXT_BACKEND_API_KEY;

// ==================== GOOGLE AUTH ====================
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.VITE_GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// ==================== FRONTEND ====================
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const AUTH_CALLBACK_URL = process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL || `${APP_URL}/auth/callback`;
export const APP_NAME = process.env.VITE_APP_NAME || 'LearnYos';
export const APP_VERSION = process.env.VITE_APP_VERSION || '1.0.0';
export const VITE_PORT = process.env.VITE_PORT || '3000';

// ==================== VALIDATION ====================
export const validateEnv = () => {
  const required = [
    { key: 'NEXT_PUBLIC_BACKEND_URL', value: BACKEND_URL },
    { key: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', value: GOOGLE_CLIENT_ID },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0) {
    console.warn(
      '⚠️  Variables de entorno faltantes:',
      missing.map(({ key }) => key).join(', ')
    );
  }
};

// Validar al cargar el módulo
if (typeof window === 'undefined') {
  validateEnv();
}

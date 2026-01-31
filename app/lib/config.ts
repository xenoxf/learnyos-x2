// ==================== API CONFIGURATION ====================

export const API_CONFIG = {
  // Base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  GOOGLE_REDIRECT_URI: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
  
  // Timeouts
  REQUEST_TIMEOUT: 30000,
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'token',
    AUTH_USER: 'user',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE_URL: '/auth/google/url',
    GOOGLE_CALLBACK: '/auth/google/callback',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    
    // Exams
    EXAMS: '/exams',
    EXAMS_GENERATE: '/exams/generate/topic_or_referencia',
    
    // Flashcards
    FLASHCARDS: '/flash-cards',
    FLASHCARDS_GENERATE: '/flash-cards/generate/topic_or_reference',
    
    // Notes
    NOTES: '/notes',
    NOTES_GENERATE: '/notes/generate/topic_or_reference',
    
    // Messages
    CHATS: '/messages/chats',
    CHAT_CREATE: '/messages/chat/create',
    MESSAGES_SEND: '/messages/send',
  },
} as const;

// ==================== DIFFICULTY LEVELS ====================

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export type Difficulty = (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS];

// ==================== VALIDATION RULES ====================

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// ==================== UI DEFAULTS ====================

export const UI_DEFAULTS = {
  // Pagination
  ITEMS_PER_PAGE: 10,
  
  // Timeouts for toasts
  TOAST_DURATION: 3000,
  
  // Animation timings
  ANIMATION_DURATION: 300,
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Sesión expirada. Por favor inicia sesión de nuevo.',
  NETWORK_ERROR: 'Error de conexión. Intenta de nuevo.',
  VALIDATION_ERROR: 'Por favor completa los campos correctamente.',
  GENERIC_ERROR: 'Algo salió mal. Intenta de nuevo.',
  
  // Auth
  INVALID_EMAIL: 'Email inválido',
  INVALID_PASSWORD: 'Contraseña inválida',
  USER_EXISTS: 'El usuario ya existe',
  
  // Generated content
  GENERATION_FAILED: 'Error al generar contenido. Intenta de nuevo.',
  INVALID_INPUT: 'Entrada inválida. Verifica los datos.',
} as const;

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Sesión iniciada correctamente',
  REGISTER_SUCCESS: 'Cuenta creada correctamente',
  LOGOUT_SUCCESS: 'Sesión cerrada',
  
  // CRUD operations
  CREATED_SUCCESS: 'Creado exitosamente',
  UPDATED_SUCCESS: 'Actualizado exitosamente',
  DELETED_SUCCESS: 'Eliminado exitosamente',
  
  // Generation
  GENERATION_SUCCESS: 'Contenido generado exitosamente',
} as const;

// ==================== HTTP METHODS ====================

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;
// ==================== API CONFIGURATION ====================

export const API_CONFIG = {
  // Base URL
  BASE_URL: process.env.VITE_BACKEND_URL || 'http://localhost:3000/api',
  
  // Optional API Key
  API_KEY: process.env.VITE_API_KEY || '',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || '',
  GOOGLE_OAUTH_URI: 'https://accounts.google.com/gsi/client',
  
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 segundos
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    AUTH_USER: 'auth_user',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_TOKEN: '/auth/verify-token',
    
    // Exams
    EXAMS: '/exams',
    EXAMS_GENERATE_TOPIC: '/exams/generate/topic',
    EXAMS_GENERATE_REFERENCE: '/exams/generate/reference',
    
    // Flashcards
    CARDS: '/flash-cards/cards',
    FLASHCARDS: '/flash-cards/flashcards',
    FLASHCARDS_GENERATE_TOPIC: '/flash-cards/generate/topic',
    FLASHCARDS_GENERATE_REFERENCE: '/flash-cards/generate/reference',
    
    // Notes
    NOTES: '/notes',
    NOTES_GENERATE_TOPIC: '/notes/generate/topic',
    NOTES_GENERATE_REFERENCE: '/notes/generate/reference',
    
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
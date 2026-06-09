/**
 * Standardized API Error Handler
 * Provides consistent error handling across the application
 */

export interface ApiErrorResponse {
  message: string;
  error?: string;
  errorCode?: string;
  details?: string[];
  status?: number;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errorCode?: string;
  public readonly details?: string[];

  constructor(message: string, status: number, errorCode?: string, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

/**
 * Parse API error response into standardized format
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Attempt to extract status if it exists on a custom error object (like from Axios or other clients)
    const status = (error as { status?: number }).status || 500;
    const errorCode = (error as { errorCode?: string }).errorCode;
    const details = (error as { details?: string[] }).details;
    
    return new ApiError(error.message, status, errorCode, details);
  }

  return new ApiError('Unknown error occurred', 500);
}

/**
 * Standard error handler that logs errors with context
 * Uses console.error for server-side logging while providing a unified interface
 */
export function errorHandler(error: unknown, context: string): void {
  const apiError = parseApiError(error);
  console.error(`[${context}]`, apiError.message, { status: apiError.status, errorCode: apiError.errorCode, details: apiError.details });
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const apiError = parseApiError(error);

  switch (apiError.status) {
    case 400:
      return apiError.message || 'Solicitud inválida';
    case 401:
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    case 403:
      return 'No tienes permiso para realizar esta acción.';
    case 404:
      return 'Recurso no encontrado.';
    case 429:
      return 'Demasiadas solicitudes. Por favor, espera un momento.';
    case 500:
    case 502:
    case 503:
      return 'Error del servidor. Por favor, intenta más tarde.';
    default:
      return apiError.message || 'Error inesperado. Por favor, intenta nuevamente.';
  }
}

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
    const customError = error as any;
    const response = customError.response;

    if (response?.data) {
      const data = response.data as ApiErrorResponse;
      return new ApiError(
        data.message || error.message,
        response.status || 500,
        data.errorCode,
        data.details,
      );
    }

    return new ApiError(error.message, 500);
  }

  return new ApiError('Unknown error occurred', 500);
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

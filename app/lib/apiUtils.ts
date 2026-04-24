import { authService } from "@/services/authService";

/**
 * Tipos de errores posibles en las peticiones
 */
export type ApiErrorType =
  | "NETWORK_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Interfaz para errores de API
 */
export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  details?: unknown;
}

/**
 * Parsear error de respuesta HTTP
 */
export const parseApiError = (error: unknown): ApiError => {
  const err = error as {
    response?: {
      status?: number;
      data?: { message?: string; error?: string; errors?: unknown };
    };
  };

  // Error de red
  if (!err || !err.response) {
    return {
      type: "NETWORK_ERROR",
      message:
        "Error de conexión. Verifica tu internet y que el servidor esté disponible.",
    };
  }

  const status = err.response?.status;
  const data = err.response?.data;

  switch (status) {
    case 401:
      // Token expirado o no válido
      authService.logout();
      return {
        type: "UNAUTHORIZED",
        message: "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
        statusCode: 401,
      };

    case 403:
      return {
        type: "FORBIDDEN",
        message: "No tienes permiso para realizar esta acción.",
        statusCode: 403,
      };

    case 404:
      return {
        type: "NOT_FOUND",
        message: "El recurso solicitado no fue encontrado.",
        statusCode: 404,
      };

    case 409:
      return {
        type: "CONFLICT",
        message:
          data?.message || "Conflicto en la solicitud. El recurso ya existe.",
        statusCode: 409,
      };

    case 422:
    case 400:
      return {
        type: "VALIDATION_ERROR",
        message: data?.message || "Los datos proporcionados no son válidos.",
        statusCode: status,
        details: data?.errors,
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: "SERVER_ERROR",
        message: "Error del servidor. Por favor intenta más tarde.",
        statusCode: status,
      };

    default:
      return {
        type: "UNKNOWN_ERROR",
        message:
          data?.message || "Error desconocido. Por favor intenta de nuevo.",
        statusCode: status,
      };
  }
};

/**
 * Obtener mensaje de error amigable para el usuario
 */
export const getErrorMessage = (error: ApiError | string): string => {
  if (typeof error === "string") {
    return error;
  }
  return error.message;
};

/**
 * Validar si hay errores de validación
 */
export const hasValidationErrors = (error: ApiError): boolean => {
  return error.type === "VALIDATION_ERROR" && !!error.details;
};

/**
 * Obtener detalles de errores de validación
 */
export const getValidationErrors = (
  error: ApiError,
): Record<string, string> => {
  if (!hasValidationErrors(error)) {
    return {};
  }
  return error.details as Record<string, string>;
};

/**
 * Manejo genérico de errores con reintentos
 */
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // No reintentar en ciertos errores
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("403")) {
          throw error;
        }
      }

      // Esperar antes de reintentar
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
};

/**
 * Debounce para funciones
 */
export const debounce = <T extends (...args: any[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle para funciones
 */
export const throttle = <T extends (...args: any[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Formatear fecha de forma legible
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return d.toLocaleDateString("es-ES", options);
};

/**
 * Formatear fecha relativa (ej: "hace 2 horas")
 */
export const formatRelativeDate = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "hace unos segundos";
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
  if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} días`;

  return formatDate(d);
};

/**
 * Verificar si el usuario está autenticado
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  return await authService.isAuthenticated();
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = () => {
  return authService.getUser();
};

/**
 * Truncar texto a cierta longitud
 */
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Capitalizar primera letra
 */
export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

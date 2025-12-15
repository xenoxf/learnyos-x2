/**
 * ApiError - Clase para manejar errores de API
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * parseErrorResponse - Parsea la respuesta de error del servidor
 */
export function parseErrorResponse(data: any): { message: string; code?: string; details?: Record<string, any> } {
  const message = data?.message || data?.error || data?.msg || 'Error desconocido';
  const code = data?.code || data?.errorCode;
  const details = data?.details || data?.data;

  return { message, code, details };
}

/**
 * getErrorMessage - Obtiene un mensaje de error legible
 */
export function getErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Error de conexión con el servidor';
  }

  if (error instanceof SyntaxError) {
    return 'Error al procesar la respuesta del servidor';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

/**
 * isNetworkError - Verifica si es un error de red
 */
export function isNetworkError(error: any): boolean {
  return error instanceof TypeError && error.message.includes('fetch');
}

/**
 * isAuthError - Verifica si es un error de autenticación
 */
export function isAuthError(error: any): boolean {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }
  return false;
}

/**
 * isServerError - Verifica si es un error del servidor
 */
export function isServerError(error: any): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500;
  }
  return false;
}

/**
 * isClientError - Verifica si es un error del cliente
 */
export function isClientError(error: any): boolean {
  if (error instanceof ApiError) {
    return error.status >= 400 && error.status < 500;
  }
  return false;
}
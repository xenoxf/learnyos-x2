// filepath: /home/juniorxf/proyectos/learnyos/src/lib/debugUtils.ts

/**
 * Utilidades de Debugging para el Flujo de Registro
 * 
 * Proporciona funciones para debuggear problemas en:
 * - Registro de usuarios
 * - Envío de correos
 * - Verificación de email
 */

// Configuración de debug
export const DEBUG_CONFIG = {
  ENABLE_LOGS: true,
  SHOW_REQUESTS: true,
  SHOW_RESPONSES: true,
};

/**
 * Log con estilos para debugging
 */
export const debugLog = (title: string, data: any, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
  if (!DEBUG_CONFIG.ENABLE_LOGS) return;

  const styles = {
    info: 'color: #0ea5e9; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    success: 'color: #10b981; font-weight: bold;',
    warning: 'color: #f59e0b; font-weight: bold;',
  };

  console.log(`%c${title}`, styles[type], data);
};

/**
 * Valida que las variables de ambiente estén configuradas
 */
export const validateEnvironment = () => {
  debugLog('🔍 === VALIDANDO CONFIGURACIÓN ===', '', 'info');

  const backendUrl = process.env.VITE_BACKEND_URL;
  const apiKey = process.env.VITE_BACKEND_KEY;

  if (!backendUrl) {
    debugLog('❌ VITE_BACKEND_URL no está configurada', '', 'error');
    return false;
  }

  if (!apiKey) {
    debugLog('❌ VITE_BACKEND_KEY no está configurada', '', 'error');
    return false;
  }

  debugLog('✅ Backend URL', backendUrl, 'success');
  debugLog('✅ API Key está presente', '✓', 'success');

  return true;
};

/**
 * Realiza una solicitud HTTP con logging detallado
 */
export const debugFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const backendUrl = process.env.VITE_BACKEND_URL;
  const apiKey = process.env.VITE_BACKEND_KEY;
  const fullUrl = `${backendUrl}${endpoint}`;

  if (DEBUG_CONFIG.SHOW_REQUESTS) {
    debugLog('📤 REQUEST', {
      method: options.method || 'GET',
      url: fullUrl,
      headers: options.headers,
      bodySize: options.body ? (options.body as string).length + ' bytes' : 'N/A',
    }, 'info');
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        ...options.headers,
      },
    });

    debugLog('📥 RESPONSE', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
    }, response.ok ? 'success' : 'error');

    const data = await response.json();

    if (DEBUG_CONFIG.SHOW_RESPONSES) {
      debugLog('📊 RESPONSE DATA', data, response.ok ? 'success' : 'error');
    }

    return { response, data };
  } catch (error) {
    debugLog('❌ FETCH ERROR', error, 'error');
    throw error;
  }
};

/**
 * Debuggea el flujo completo de registro
 */
export const debugRegisterFlow = async (
  email: string,
  password: string,
  name: string
) => {
  debugLog('🔍 === INICIANDO FLUJO DE REGISTRO ===', '', 'info');

  // Validar ambiente
  if (!validateEnvironment()) {
    throw new Error('Configuración inválida');
  }

  // Validar datos
  debugLog('👤 Datos de usuario', {
    email,
    name,
    passwordLength: password.length + ' caracteres',
  }, 'info');

  try {
    // Enviar solicitud
    const { response, data } = await debugFetch('/auth/pre-register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      debugLog('❌ Error en pre-register', data, 'error');
      throw new Error(data.error || data.message || 'Error desconocido');
    }

    debugLog('✅ Pre-registro exitoso', data, 'success');
    debugLog('📧 Correo debe enviarse a', email, 'success');

    return data;
  } catch (error: any) {
    debugLog('❌ ERROR EN FLUJO DE REGISTRO', {
      message: error.message,
      name: error.name,
    }, 'error');
    throw error;
  }
};

/**
 * Debuggea el flujo de verificación de email
 */
export const debugVerifyEmail = async (token: string) => {
  debugLog('🔍 === VERIFICANDO EMAIL ===', '', 'info');
  debugLog('🔐 Token', token.substring(0, 20) + '...', 'info');

  try {
    const { response, data } = await debugFetch(`/auth/verify-email/${token}`, {
      method: 'GET',
    });

    if (!response.ok) {
      debugLog('❌ Error verificando email', data, 'error');
      throw new Error(data.error || 'Error al verificar email');
    }

    debugLog('✅ Email verificado', data, 'success');
    return data;
  } catch (error: any) {
    debugLog('❌ ERROR EN VERIFICACIÓN', error.message, 'error');
    throw error;
  }
};

/**
 * Debuggea el flujo de completar registro
 */
export const debugRegisterFinal = async (token: string) => {
  debugLog('🔍 === COMPLETANDO REGISTRO ===', '', 'info');
  debugLog('🔐 Token', token.substring(0, 20) + '...', 'info');

  try {
    const { response, data } = await debugFetch(`/auth/register-final/${token}`, {
      method: 'POST',
    });

    if (!response.ok) {
      debugLog('❌ Error completando registro', data, 'error');
      throw new Error(data.error || 'Error al completar registro');
    }

    debugLog('✅ Registro completado', data, 'success');
    return data;
  } catch (error: any) {
    debugLog('❌ ERROR EN COMPLETAR REGISTRO', error.message, 'error');
    throw error;
  }
};

/**
 * Debuggea el flujo de login
 */
export const debugLogin = async (email: string, password: string) => {
  debugLog('🔍 === INICIANDO LOGIN ===', '', 'info');
  debugLog('📧 Email', email, 'info');
  debugLog('🔐 Contraseña', password.length + ' caracteres', 'info');

  try {
    const { response, data } = await debugFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      debugLog('❌ Error en login', data, 'error');
      throw new Error(data.error || 'Credenciales inválidas');
    }

    debugLog('✅ Login exitoso', {
      userId: data.data?.user?.id,
      email: data.data?.user?.email,
      tokenLength: data.data?.token?.length + ' caracteres',
    }, 'success');

    return data;
  } catch (error: any) {
    debugLog('❌ ERROR EN LOGIN', error.message, 'error');
    throw error;
  }
};

/**
 * Imprime un resumen del estado actual
 */
export const printDebugSummary = () => {
  console.clear();
  console.log('%c╔════════════════════════════════════════╗', 'color: #0ea5e9; font-weight: bold;');
  console.log('%c║         📊 DEBUG SUMMARY               ║', 'color: #0ea5e9; font-weight: bold;');
  console.log('%c╚════════════════════════════════════════╝', 'color: #0ea5e9; font-weight: bold;');

  debugLog('Backend URL', process.env.VITE_BACKEND_URL, 'info');
  debugLog('API Key', process.env.VITE_BACKEND_KEY ? '✓ Configurada' : '✗ No configurada', 'info');
  if (typeof window !== 'undefined') {
    debugLog('Frontend URL', window.location.origin, 'info');
  }
  debugLog('Environment', process.env.MODE, 'info');
};
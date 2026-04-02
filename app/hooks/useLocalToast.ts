/**
 * ============================================
 * useLocalToast - Sistema de Notificaciones Local
 * ============================================
 * 
 * Hook personalizado para manejar notificaciones/toasts
 * sin dependencias externas. Usa las variables CSS globales
 * para soporte completo de temas.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface UseLocalToastReturn {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  dismissAll: () => void;
  success: (title: string, description?: string, duration?: number) => string;
  error: (title: string, description?: string, duration?: number) => string;
  warning: (title: string, description?: string, duration?: number) => string;
  info: (title: string, description?: string, duration?: number) => string;
}

const TOAST_LIMIT = 5;
const DEFAULT_DURATION = 5000;

let toastCounter = 0;

function generateId(): string {
  toastCounter = (toastCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${Date.now()}-${toastCounter}`;
}

// Store global para compartir estado entre componentes
let globalToasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];
let toastTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

function notifyListeners() {
  listeners.forEach(listener => listener(globalToasts));
}

function addTimeout(toastId: string, duration: number) {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    removeToast(toastId);
  }, duration);

  toastTimeouts.set(toastId, timeout);
}

function removeToast(id: string) {
  globalToasts = globalToasts.filter(t => t.id !== id);
  if (toastTimeouts.has(id)) {
    clearTimeout(toastTimeouts.get(id));
    toastTimeouts.delete(id);
  }
  notifyListeners();
}

function addToast(toast: Omit<Toast, 'id'>): string {
  const id = generateId();
  const duration = toast.duration ?? DEFAULT_DURATION;

  const newToast: Toast = {
    ...toast,
    id,
  };

  // Limitar número de toasts
  if (globalToasts.length >= TOAST_LIMIT) {
    const oldest = globalToasts[globalToasts.length - 1];
    removeToast(oldest.id);
  }

  globalToasts = [newToast, ...globalToasts];
  notifyListeners();

  // Auto-dismiss
  if (duration > 0) {
    addTimeout(id, duration);
  }

  return id;
}

function dismissAll() {
  globalToasts.forEach(toast => {
    if (toastTimeouts.has(toast.id)) {
      clearTimeout(toastTimeouts.get(toast.id));
      toastTimeouts.delete(toast.id);
    }
  });
  globalToasts = [];
  toastTimeouts.clear();
  notifyListeners();
}

// Funciones helper para cada tipo de toast
function success(title: string, description?: string, duration?: number): string {
  return addToast({ type: 'success', title, description, duration });
}

function error(title: string, description?: string, duration?: number): string {
  return addToast({ type: 'error', title, description, duration });
}

function warning(title: string, description?: string, duration?: number): string {
  return addToast({ type: 'warning', title, description, duration });
}

function info(title: string, description?: string, duration?: number): string {
  return addToast({ type: 'info', title, description, duration });
}

export function useLocalToast(): UseLocalToastReturn {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts([...newToasts]);
    };

    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    dismissAll,
    success,
    error,
    warning,
    info,
  };
}

// Exportar funciones directamente para uso fuera de componentes
export const toast = {
  success,
  error,
  warning,
  info,
  add: addToast,
  remove: removeToast,
  dismissAll,
};

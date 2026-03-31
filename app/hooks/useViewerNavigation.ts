"use client";

import { useCallback, useState } from "react";

/**
 * Hook personalizado para manejar navegación entre Grid y Vista de Detalle
 * Reemplaza el patrón de modales con navegación condicional de componentes
 * 
 * @param initialState - Estado inicial (null = mostrar Grid, número = mostrar Detalle con ese ID)
 * @returns Objeto con selectedId, handlers y utilidades
 */
export function useViewerNavigation<T extends number | null = number | null>(initialState: T = null as T) {
  const [selectedId, setSelectedId] = useState<T>(initialState);

  const openDetail = useCallback((id: number) => {
    setSelectedId(id as T);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedId(null as T);
  }, []);

  const isOpen = selectedId !== null && selectedId !== undefined;

  return {
    selectedId,
    isOpen,
    openDetail,
    closeDetail,
  };
}

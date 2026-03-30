"use client";

import { useState, useCallback } from "react";
import type { AlertType } from "@/components/CustomAlert";

interface AlertParams {
  isOpen: boolean;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  resolve?: (value: boolean) => void;
}

export function useCustomAlert() {
  const [alertState, setAlertState] = useState<AlertParams>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const show = useCallback((params: Omit<AlertParams, "isOpen" | "resolve">): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        title: params.title,
        message: params.message,
        type: params.type || "info",
        confirmText: params.confirmText,
        cancelText: params.cancelText,
        showCancel: params.showCancel,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setAlertState((prev) => {
      prev.resolve?.(false);
      return { ...prev, isOpen: false };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setAlertState((prev) => {
      prev.resolve?.(true);
      return { ...prev, isOpen: false };
    });
  }, []);

  return {
    alert: { show },
    alertState,
    handleClose,
    handleConfirm,
  };
}

"use client";
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/apiService';
import { toast } from '@/hooks/useLocalToast';
import { Trash2, Loader2 } from 'lucide-react';

interface AccountDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const AccountDeletionDialog: React.FC<AccountDeletionDialogProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [isLoading, setIsLoading] = useState(false);
  ;

  const handleDeleteRequest = async () => {
    setIsLoading(true);
    try {
      // Note: Backend doesn't have delete user endpoint yet
      toast.info("", "");
      // apiService.logout();
      // window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Error", "Algo salió mal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Eliminar cuenta
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar tu cuenta permanentemente?
            Esta acción <strong>no se puede deshacer</strong>.
            Todos tus datos, incluyendo conversaciones, notas y configuraciones, se perderán para siempre.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteRequest}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar eliminación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

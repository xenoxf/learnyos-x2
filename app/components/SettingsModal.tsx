"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { useCodeTheme, CodeTheme } from '@/contexts/CodeThemeContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { AccountDeletionDialog } from '@/components/AccountDeletionDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Settings, Palette, Bell, Shield, Trash2, Download, Upload, Code, Check } from 'lucide-react';
interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange
}) => {
  const {
    theme,
    setTheme
  } = useTheme();
  const {
    codeTheme,
    setCodeTheme
  } = useCodeTheme();
  const isMobile = useIsMobile();
  const availableThemes: {
    id: Theme;
    name: string;
    color: string;
  }[] = [{
    id: 'light',
    name: 'Claro',
    color: 'bg-gradient-to-br from-slate-100 to-slate-200'
  }, {
    id: 'dark',
    name: 'Oscuro',
    color: 'bg-gradient-to-br from-zinc-800 to-zinc-900'
  }, {
    id: 'ocean',
    name: 'Ocean',
    color: 'bg-gradient-to-br from-sky-400 to-cyan-500'
  }, {
    id: 'coffee',
    name: 'Café',
    color: 'bg-gradient-to-br from-amber-600 to-orange-700'
  }, {
    id: 'forest',
    name: 'Bosque',
    color: 'bg-gradient-to-br from-emerald-500 to-green-600'
  }, {
    id: 'sunset',
    name: 'Atardecer',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500'
  }];
  const codeThemes: {
    id: CodeTheme;
    name: string;
  }[] = [{
    id: 'vscDarkPlus',
    name: 'VS Code Dark'
  }, {
    id: 'atomOneDark',
    name: 'Atom Dark'
  }, {
    id: 'githubLight',
    name: 'GitHub Light'
  }, {
    id: 'nightOwl',
    name: 'Night Owl'
  }];
  const {
    toast
  } = useToast();
  const user = apiService.getUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const clearAllNotes = async () => {
    try {
      if (user && apiService.isAuthenticated()) {
        const notes = await apiService.getNotes();
        for (const note of notes) {
          await apiService.deleteNote(note.id);
        }
      }
      const userId = localStorage.getItem('currentUserId') || 'default-user';
      localStorage.removeItem(`learnyOS_notes_${userId}`);
      toast({
        title: "Notas eliminadas",
        description: "Todas tus notas han sido eliminadas."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar todas las notas.",
        variant: "destructive"
      });
    }
  };
  const clearAllFlashcards = async () => {
    try {
      if (user && apiService.isAuthenticated()) {
        const cards = await apiService.getCards();
        for (const card of cards) {
          const flashcards = await apiService.getFlashcardsByCard(card.id);
          for (const fc of flashcards) {
            await apiService.deleteFlashcard(fc.id);
          }
        }
      }
      const userId = localStorage.getItem('currentUserId') || 'default-user';
      localStorage.removeItem(`learnyOS_flashcards_${userId}`);
      toast({
        title: "Flashcards eliminadas",
        description: "Todas tus flashcards han sido eliminadas."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar todas las flashcards.",
        variant: "destructive"
      });
    }
  };
  const clearAllExams = async () => {
    try {
      if (user && apiService.isAuthenticated()) {
        const exams = await apiService.getExams();
        for (const exam of exams) {
          await apiService.deleteExam(exam.id);
        }
      }
      const userId = localStorage.getItem('currentUserId') || 'default-user';
      localStorage.removeItem(`learnyOS_exams_${userId}`);
      toast({
        title: "Exámenes eliminados",
        description: "Todos tus exámenes han sido eliminados."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar todos los exámenes.",
        variant: "destructive"
      });
    }
  };
  const clearAllChats = async () => {
    try {
      const userId = localStorage.getItem('currentUserId') || 'default-user';
      localStorage.removeItem(`learnyOS_chat_${userId}`);
      toast({
        title: "Chats eliminados",
        description: "Historial de chats eliminado."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar todos los chats.",
        variant: "destructive"
      });
    }
  };
  const exportData = () => {
    try {
      const userId = localStorage.getItem('currentUserId') || 'default-user';
      const data = {
        notes: localStorage.getItem(`learnyOS_notes_${userId}`),
        chat: localStorage.getItem(`learnyOS_chat_${userId}`),
        flashcards: localStorage.getItem(`learnyOS_flashcards_${userId}`),
        settings: localStorage.getItem(`learnyOS_settings_${userId}`)
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnyos-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Datos exportados",
        description: "Se ha descargado una copia de tus datos."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos.",
        variant: "destructive"
      });
    }
  };
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const userId = localStorage.getItem('currentUserId') || 'default-user';
        if (data.notes) localStorage.setItem(`learnyOS_notes_${userId}`, data.notes);
        if (data.chat) localStorage.setItem(`learnyOS_chat_${userId}`, data.chat);
        if (data.flashcards) localStorage.setItem(`learnyOS_flashcards_${userId}`, data.flashcards);
        if (data.settings) localStorage.setItem(`learnyOS_settings_${userId}`, data.settings);
        toast({
          title: "Datos importados",
          description: "Se han restaurado tus datos. Recarga la página para ver los cambios."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "El archivo no es válido.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };
  const SettingsContent = () => <div className="space-y-4 overflow-y-auto max-h-[75vh] px-1">
      {/* Header */}
      

      {/* User Profile */}
      {user && <div className="p-4 bg-muted/50 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full focus-gradient flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-bold text-lg">
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">{user.name || 'Usuario'}</h4>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>}

      {/* App Theme */}
      <div className="space-y-2">
        
        <div className="grid grid-cols-3 gap-1.5">
          {availableThemes.map(themeOption => (
            <button 
              key={themeOption.id} 
              onClick={() => setTheme(themeOption.id as Theme)} 
              className={`p-2 rounded-lg text-xs font-medium transition-all border-2 ${theme === themeOption.id ? 'border-primary bg-primary text-primary-foreground' : 'border-transparent bg-muted hover:bg-muted/80 text-foreground'}`}
            >
              {themeOption.name}
            </button>
          ))}
        </div>
      </div>

      {/* Code Theme */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Tema de Código</h3>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {codeThemes.map(codeThemeOption => <button key={codeThemeOption.id} onClick={() => setCodeTheme(codeThemeOption.id)} className={`p-2 rounded-lg text-xs font-medium transition-all text-left border-2 ${codeTheme === codeThemeOption.id ? 'border-primary bg-primary text-primary-foreground' : 'border-transparent bg-muted hover:bg-muted/80 text-foreground'}`}>
              {codeThemeOption.name}
            </button>)}
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Preferencias</h3>
        </div>
        <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-sm text-foreground">Notificaciones</Label>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="autoSave" className="text-sm text-foreground">Guardado automático</Label>
            <Switch id="autoSave" checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Gestión de Datos</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={exportData} variant="outline" size="sm" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <div>
            <input type="file" accept=".json" onChange={importData} className="hidden" id="import-file" />
            <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="w-full h-10">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Borrar datos específicos:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={clearAllNotes} variant="outline" size="sm" className="text-xs h-9">
              <Trash2 className="mr-1 h-3 w-3" />
              Notas
            </Button>
            <Button onClick={clearAllFlashcards} variant="outline" size="sm" className="text-xs h-9">
              <Trash2 className="mr-1 h-3 w-3" />
              Flashcards
            </Button>
            <Button onClick={clearAllExams} variant="outline" size="sm" className="text-xs h-9">
              <Trash2 className="mr-1 h-3 w-3" />
              Exámenes
            </Button>
            <Button onClick={clearAllChats} variant="outline" size="sm" className="text-xs h-9">
              <Trash2 className="mr-1 h-3 w-3" />
              Chats
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-3 pt-4 border-t border-destructive/20">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-destructive" />
          <h3 className="font-semibold text-destructive">Zona Peligrosa</h3>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar cuenta
        </Button>
      </div>

      <AccountDeletionDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} user={user} />
    </div>;
  if (isMobile) {
    return <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-4">
          <SettingsContent />
        </SheetContent>
      </Sheet>;
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4 gap-0">
        <SettingsContent />
      </DialogContent>
    </Dialog>;
};
export default SettingsModal;
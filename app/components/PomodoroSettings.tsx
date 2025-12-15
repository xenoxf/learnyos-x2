"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { X, Minus, Plus, Clock, Coffee, Star, Repeat } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PomodoroSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  onWorkDurationChange: (value: number) => void;
  onBreakDurationChange: (value: number) => void;
  onLongBreakDurationChange: (value: number) => void;
  onSessionsUntilLongBreakChange: (value: number) => void;
}

export const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({
  isOpen,
  onClose,
  workDuration,
  breakDuration,
  longBreakDuration,
  sessionsUntilLongBreak,
  onWorkDurationChange,
  onBreakDurationChange,
  onLongBreakDurationChange,
  onSessionsUntilLongBreakChange,
}) => {
  const isMobile = useIsMobile();

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Grid layout for desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Duration - Slider */}
        <div className="space-y-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            <Label className="text-sm font-medium">Trabajo</Label>
            <span className="ml-auto text-lg font-bold text-cyan-500">{workDuration} min</span>
          </div>
          <Slider
            value={[workDuration]}
            onValueChange={(value) => onWorkDurationChange(value[0])}
            min={5}
            max={60}
            step={5}
            className="[&_[role=slider]]:bg-cyan-500"
          />
        </div>

        {/* Short Break - Slider */}
        <div className="space-y-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-emerald-500" />
            <Label className="text-sm font-medium">Descanso corto</Label>
            <span className="ml-auto text-lg font-bold text-emerald-500">{breakDuration} min</span>
          </div>
          <Slider
            value={[breakDuration]}
            onValueChange={(value) => onBreakDurationChange(value[0])}
            min={1}
            max={15}
            step={1}
            className="[&_[role=slider]]:bg-emerald-500"
          />
        </div>

        {/* Long Break - Slider */}
        <div className="space-y-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-500" />
            <Label className="text-sm font-medium">Descanso largo</Label>
            <span className="ml-auto text-lg font-bold text-purple-500">{longBreakDuration} min</span>
          </div>
          <Slider
            value={[longBreakDuration]}
            onValueChange={(value) => onLongBreakDurationChange(value[0])}
            min={10}
            max={30}
            step={5}
            className="[&_[role=slider]]:bg-purple-500"
          />
        </div>

        {/* Sessions Until Long Break - Stepper */}
        <div className="space-y-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-amber-500" />
            <Label className="text-sm font-medium">Sesiones hasta descanso largo</Label>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSessionsUntilLongBreakChange(Math.max(2, sessionsUntilLongBreak - 1))}
              className="h-10 w-10 rounded-full border-amber-500/30 hover:bg-amber-500/20"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    i < sessionsUntilLongBreak ? "bg-amber-500" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSessionsUntilLongBreakChange(Math.min(10, sessionsUntilLongBreak + 1))}
              className="h-10 w-10 rounded-full border-amber-500/30 hover:bg-amber-500/20"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">{sessionsUntilLongBreak} sesiones</p>
        </div>
      </div>
      
      <Button onClick={onClose} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white">
        Guardar Configuración
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>Configuración Pomodoro</DrawerTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            <SettingsContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Configuración Pomodoro</DialogTitle>
        </DialogHeader>
        <SettingsContent />
      </DialogContent>
    </Dialog>
  );
};

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { X, Minus, Plus, Clock, Coffee, Star, Repeat } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import styles from "@/styles/PomodoroTimer.module.css";

interface PomodoroSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PomodoroConfig {
  workDuration: number;
  breakDuration: number;
  sessionsBeforeLongBreak: number;
  longBreakDuration: number;
  autoStartBreak: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const isMobile = useIsMobile();

  const SettingsContent = () => (
    <div className={styles.settingsContent}>
      {/* Grid layout for desktop */}
      <div className={styles.settingsGrid}>
        {/* Work Duration - Slider */}
        <div className={`${styles.settingCard} ${styles.workSetting}`}>
          <div className={styles.settingHeader}>
            <Clock className={styles.settingIcon} />
            <Label className={styles.settingLabel}>Trabajo</Label>
            <span className={styles.settingValue}>25 min</span>
          </div>
          <Slider
            value={[25]}
            onValueChange={(value) => {}}
            min={5}
            max={60}
            step={5}
            className={styles.workSlider}
          />
        </div>

        {/* Short Break - Slider */}
        <div className={`${styles.settingCard} ${styles.shortBreakSetting}`}>
          <div className={styles.settingHeader}>
            <Coffee className={styles.settingIcon} />
            <Label className={styles.settingLabel}>Descanso corto</Label>
            <span className={styles.settingValue}>5 min</span>
          </div>
          <Slider
            value={[5]}
            onValueChange={(value) => {}}
            min={1}
            max={15}
            step={1}
            className={styles.breakSlider}
          />
        </div>

        {/* Long Break - Slider */}
        <div className={`${styles.settingCard} ${styles.longBreakSetting}`}>
          <div className={styles.settingHeader}>
            <Star className={styles.settingIcon} />
            <Label className={styles.settingLabel}>Descanso largo</Label>
            <span className={styles.settingValue}>15 min</span>
          </div>
          <Slider
            value={[15]}
            onValueChange={(value) => {}}
            min={10}
            max={30}
            step={5}
            className={styles.longBreakSlider}
          />
        </div>

        {/* Sessions Until Long Break - Stepper */}
        <div className={`${styles.settingCard} ${styles.sessionsSetting}`}>
          <div className={styles.settingHeader}>
            <Repeat className={styles.settingIcon} />
            <Label className={styles.settingLabel}>
              Sesiones hasta descanso largo
            </Label>
          </div>
          <div className={styles.sessionsStepper}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {}}
              className={styles.stepperButton}
            >
              <Minus className={styles.smallIcon} />
            </Button>
            <div className={styles.sessionsDots}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`${styles.sessionDot} ${i < 4 ? styles.activeDot : styles.inactiveDot}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {}}
              className={styles.stepperButton}
            >
              <Plus className={styles.smallIcon} />
            </Button>
          </div>
          <p className={styles.sessionsCount}>4 sesiones</p>
        </div>
      </div>

      <Button onClick={onClose} className={styles.saveButton}>
        Guardar Configuración
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className={styles.mobileDrawer}>
          <DrawerHeader className={styles.drawerHeader}>
            <DrawerTitle>Configuración Pomodoro</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={styles.closeButton}
            >
              <X className={styles.smallIcon} />
            </Button>
          </DrawerHeader>
          <div className={styles.mobileContent}>
            <SettingsContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.desktopDialog}>
        <DialogHeader>
          <DialogTitle>Configuración Pomodoro</DialogTitle>
        </DialogHeader>
        <SettingsContent />
      </DialogContent>
    </Dialog>
  );
};

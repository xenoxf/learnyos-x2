'use client';

import React, { useState } from 'react';
import styles from '@/styles/themeToggle.module.css';

interface PomodoroSettingsProps {
  onClose: () => void;
}

const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    cyclesBeforeLongBreak: 4,
  });

  const handleChange = (key: keyof typeof settings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Guardar en localStorage si es necesario
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    onClose();
  };

  return (
    <div className={styles.settings}>
      <h3>Configuración Pomodoro</h3>

      <div>
        <label>
          Tiempo de trabajo (minutos):
          <input
            type="number"
            min="1"
            max="60"
            value={settings.workTime}
            onChange={(e) => handleChange('workTime', parseInt(e.target.value))}
          />
        </label>
      </div>

      <div>
        <label>
          Descanso corto (minutos):
          <input
            type="number"
            min="1"
            max="30"
            value={settings.shortBreak}
            onChange={(e) => handleChange('shortBreak', parseInt(e.target.value))}
          />
        </label>
      </div>

      <div>
        <label>
          Descanso largo (minutos):
          <input
            type="number"
            min="1"
            max="60"
            value={settings.longBreak}
            onChange={(e) => handleChange('longBreak', parseInt(e.target.value))}
          />
        </label>
      </div>

      <div>
        <label>
          Ciclos antes de descanso largo:
          <input
            type="number"
            min="1"
            max="10"
            value={settings.cyclesBeforeLongBreak}
            onChange={(e) =>
              handleChange('cyclesBeforeLongBreak', parseInt(e.target.value))
            }
          />
        </label>
      </div>

      <div>
        <button onClick={handleSave}>Guardar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default PomodoroSettings;

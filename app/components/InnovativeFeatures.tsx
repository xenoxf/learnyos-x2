"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyTechniques } from './StudyTechniques';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const InnovativeFeatures: React.FC = () => {
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  const [autoTimerStarted, setAutoTimerStarted] = useState(false);
  const { loadData, saveData } = useLocalStorage();

  // Auto-start study timer when entering the app
  useEffect(() => {
    const userId = localStorage.getItem('currentUserId') || 'default-user';
    const autoTimer = loadData(`learnyOS_autoTimer_${userId}`, { started: false, startTime: null });
    
    if (!autoTimer.started) {
      const startTime = Date.now();
      saveData(`learnyOS_autoTimer_${userId}`, { started: true, startTime });
      setAutoTimerStarted(true);
    }
  }, [loadData, saveData]);

  const startAmbientSound = (type: string) => {
    setAmbientSound(type);
    console.log(`Iniciando sonido ambiente: ${type}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ambient Sounds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎵 Ambiente Inteligente
            <Badge variant="outline">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'rain', name: 'Lluvia', emoji: '🌧️' },
              { id: 'forest', name: 'Bosque', emoji: '🌲' },
              { id: 'cafe', name: 'Cafetería', emoji: '☕' },
              { id: 'waves', name: 'Océano', emoji: '🌊' }
            ].map(sound => (
              <Button
                key={sound.id}
                variant={ambientSound === sound.id ? "default" : "outline"}
                size="sm"
                onClick={() => startAmbientSound(sound.id)}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <span className="text-lg">{sound.emoji}</span>
                <span className="text-xs">{sound.name}</span>
              </Button>
            ))}
          </div>
          {ambientSound && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg flex items-center justify-between">
              <span className="text-sm text-green-700 dark:text-green-300">
                🎵 Reproduciendo: {ambientSound}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setAmbientSound(null)}>
                Parar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Techniques */}
      <StudyTechniques />
    </div>
  );
};

"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Target, Clock, CheckCircle } from 'lucide-react';

interface Technique {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  timeRequired: string;
}

const techniques: Technique[] = [
  {
    id: 'pomodoro',
    name: 'Técnica Pomodoro',
    description: 'Divide tu estudio en intervalos de 25 minutos con descansos cortos',
    icon: <Clock className="w-6 h-6" />,
    steps: [
      'Elige una tarea específica',
      'Programa 25 minutos de trabajo intenso',
      'Toma un descanso de 5 minutos',
      'Repite 4 veces y toma un descanso largo de 15-30 minutos'
    ],
    difficulty: 'Fácil',
    timeRequired: '25 min'
  },
  {
    id: 'feynman',
    name: 'Método Feynman',
    description: 'Explica conceptos complejos de manera simple para comprenderlos mejor',
    icon: <Brain className="w-6 h-6" />,
    steps: [
      'Escoge un concepto que quieras aprender',
      'Explícalo como si enseñaras a un niño',
      'Identifica las lagunas en tu explicación',
      'Vuelve al material fuente y mejora tu comprensión'
    ],
    difficulty: 'Intermedio',
    timeRequired: '30-45 min'
  },
  {
    id: 'spaced-repetition',
    name: 'Repetición Espaciada',
    description: 'Revisa material en intervalos cada vez más largos para mejorar la retención',
    icon: <Target className="w-6 h-6" />,
    steps: [
      'Estudia el material inicialmente',
      'Revísalo después de 1 día',
      'Revísalo después de 3 días',
      'Revísalo después de 1 semana, luego 2 semanas, etc.'
    ],
    difficulty: 'Intermedio',
    timeRequired: 'Continuo'
  },
  {
    id: 'active-recall',
    name: 'Recuperación Activa',
    description: 'Prueba tu memoria activamente en lugar de solo releer',
    icon: <CheckCircle className="w-6 h-6" />,
    steps: [
      'Lee el material una vez',
      'Cierra el libro/apuntes',
      'Intenta recordar todo lo que puedas',
      'Verifica qué recordaste correctamente'
    ],
    difficulty: 'Fácil',
    timeRequired: '15-30 min'
  }
];

export const StudyTechniques: React.FC = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'Avanzado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedTechnique) {
    return (
      <Card className="h-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedTechnique.icon}
              <CardTitle className="break-words w-auto">{selectedTechnique.name}</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedTechnique(null)}>
              ← Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-auto">
          <div className="space-y-4">
            <p className="text-muted-foreground break-words w-auto">{selectedTechnique.description}</p>
            
            <div className="flex gap-2">
              <Badge className={getDifficultyColor(selectedTechnique.difficulty)}>
                {selectedTechnique.difficulty}
              </Badge>
              <Badge variant="outline">
                {selectedTechnique.timeRequired}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Pasos a seguir:</h4>
              <ol className="space-y-2">
                {selectedTechnique.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm break-words w-auto">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Button onClick={() => setSelectedTechnique(null)} className="w-full">
              Comenzar a Aplicar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Técnicas de Estudio
        </CardTitle>
      </CardHeader>
      <CardContent className="h-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {techniques.map((technique) => (
            <Button
              key={technique.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent text-left"
              onClick={() => setSelectedTechnique(technique)}
            >
              <div className="flex items-center gap-2 w-full">
                {technique.icon}
                <span className="font-semibold text-sm break-words w-auto">{technique.name}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left break-words w-auto">
                {technique.description}
              </span>
              <Badge className={`text-xs ${getDifficultyColor(technique.difficulty)}`}>
                {technique.difficulty}
              </Badge>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

"use client"

/**
 * ============================================
 * DASHBOARD PAGE
 * ============================================
 * 
 * Página principal del dashboard con todas las herramientas.
 * Convertido de Tailwind a CSS puro con diseño responsive mejorado.
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { MemoryGame } from '@/components/MemoryGame';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { CoreLearningStatus } from '@/components/CoreLearningStatus';
import { MessageSquare, FileText, Layers, BookOpen, Globe, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const router = useRouter();

  const primaryTools = useMemo(() => [
    {
      title: 'Junior IA',
      icon: MessageSquare,
      path: '/chat',
      gradient: 'linear-gradient(to bottom right, #06b6d4, #2563eb)',
      glowColor: 'rgba(6, 182, 212, 0.3)',
      description: 'Conversa con inteligencia artificial avanzada',
    },
    {
      title: 'Exámenes',
      icon: FileText,
      path: '/quiz',
      gradient: 'linear-gradient(to bottom right, #7c3aed, #6d28d9)',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      description: 'Crea y practica evaluaciones personalizadas',
    },
  ], []);

  const secondaryTools = useMemo(() => [
    {
      title: 'Flashcards',
      icon: Layers,
      path: '/flashcards',
      gradient: 'linear-gradient(to bottom right, #f97316, #ef4444)',
      glowColor: 'rgba(249, 115, 22, 0.3)',
      description: 'Tarjetas de memoria',
    },
    {
      title: 'Notas',
      icon: BookOpen,
      path: '/notes',
      gradient: 'linear-gradient(to bottom right, #10b981, #14b8a6)',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      description: 'Apuntes inteligentes',
    },
    {
      title: 'Traductor',
      icon: Globe,
      path: '/translator',
      gradient: 'linear-gradient(to bottom right, #ec4899, #f43f5e)',
      glowColor: 'rgba(236, 72, 153, 0.3)',
      description: 'Traduce cualquier texto',
    }
  ], []);

  return (
    <>
      <div className="dashboard-container">
        {/* Tip Banner */}
        <section className="dashboard-section">
          <CoreLearningStatus />
        </section>

        {/* Primary Tools - JuniorIA & Exámenes (Bigger) */}
        <section className="dashboard-section">
          <div className="dashboard-grid dashboard-grid-primary">
            {primaryTools.map((tool, index) => {
              const IconComponent = tool.icon;
              
              return (
                <Card 
                  key={tool.title}
                  className="dashboard-card dashboard-card-primary"
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    '--glow-color': tool.glowColor,
                  } as React.CSSProperties}
                  onClick={() => router.push(tool.path)}
                >
                  <CardContent className="dashboard-card-content">
                    <div 
                      className="dashboard-card-icon"
                      style={{ background: tool.gradient }}
                    >
                      <IconComponent className="dashboard-icon" />
                    </div>
                    <div className="dashboard-card-text">
                      <CardTitle className="dashboard-card-title">
                        {tool.title}
                      </CardTitle>
                      <p className="dashboard-card-description">
                        {tool.description}
                      </p>
                    </div>
                    <div className="dashboard-card-arrow">
                      <ArrowRight className="dashboard-arrow-icon" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Secondary Tools - Smaller Cards */}
        <section className="dashboard-section">
          <div className="dashboard-grid dashboard-grid-secondary">
            {secondaryTools.map((tool, index) => {
              const IconComponent = tool.icon;
              
              return (
                <Card 
                  key={tool.title}
                  className="dashboard-card dashboard-card-secondary"
                  style={{ 
                    animationDelay: `${(index + 2) * 0.05}s`,
                    '--glow-color': tool.glowColor,
                  } as React.CSSProperties}
                  onClick={() => router.push(tool.path)}
                >
                  <CardContent className="dashboard-card-content">
                    <div 
                      className="dashboard-card-icon dashboard-card-icon-small"
                      style={{ background: tool.gradient }}
                    >
                      <IconComponent className="dashboard-icon dashboard-icon-small" />
                    </div>
                    <div className="dashboard-card-text">
                      <CardTitle className="dashboard-card-title dashboard-card-title-small">
                        {tool.title}
                      </CardTitle>
                      <p className="dashboard-card-description dashboard-card-description-small">
                        {tool.description}
                      </p>
                    </div>
                    <div className="dashboard-card-arrow">
                      <ArrowRight className="dashboard-arrow-icon dashboard-arrow-icon-small" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Pomodoro and Memory Game */}
        <section className="dashboard-section">
          <div className="dashboard-grid dashboard-grid-tools">
            <PomodoroTimer />
            <MemoryGame />
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100%;
          max-width: 80rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-section {
          animation: fade-in-up 0.5s ease-out;
        }

        .dashboard-grid {
          display: grid;
          gap: 1rem;
        }

        .dashboard-grid-primary {
          grid-template-columns: 1fr;
        }

        .dashboard-grid-secondary {
          grid-template-columns: 1fr;
        }

        .dashboard-grid-tools {
          grid-template-columns: 1fr;
        }

        .dashboard-card {
          cursor: pointer;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          background: hsl(var(--card) / 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
      border: 1px solid hsl(var(--border) / 0.5);
          animation: fade-in-up 0.5s ease-out;
        }

        .dashboard-card:hover {
          transform: scale(1.02);
          box-shadow: 0 0 40px var(--glow-color, rgba(0, 0, 0, 0.1));
        }

        .dashboard-card-primary {
          /* Estilos específicos para tarjetas primarias */
        }

        .dashboard-card-secondary {
          /* Estilos específicos para tarjetas secundarias */
        }

        .dashboard-card-content {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
        }

        .dashboard-card-icon {
          width: 5rem;
          height: 5rem;
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-xl);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .dashboard-card:hover .dashboard-card-icon {
          transform: scale(1.1) rotate(3deg);
        }

        .dashboard-card-icon-small {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 1rem;
        }

        .dashboard-icon {
          width: 2.5rem;
          height: 2.5rem;
          color: white;
        }

        .dashboard-icon-small {
          width: 1.75rem;
          height: 1.75rem;
        }

        .dashboard-card-text {
          flex: 1;
          min-width: 0;
        }

        .dashboard-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: hsl(var(--card-foreground));
          transition: color 0.3s;
          margin-bottom: 0.25rem;
        }

        .dashboard-card:hover .dashboard-card-title {
          color: hsl(var(--primary));
        }

        .dashboard-card-title-small {
          font-size: 1.125rem;
        }

        .dashboard-card-description {
          font-size: 1rem;
          color: hsl(var(--muted-foreground));
          margin-top: 0.25rem;
        }

        .dashboard-card-description-small {
          font-size: 0.875rem;
          margin-top: 0.125rem;
        }

        .dashboard-card-arrow {
          opacity: 0;
          transition: all 0.3s;
          transform: translateX(0);
        }

        .dashboard-card:hover .dashboard-card-arrow {
          opacity: 1;
          transform: translateX(0.25rem);
        }

        .dashboard-arrow-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: hsl(var(--primary));
        }

        .dashboard-arrow-icon-small {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Responsive Design */
        @media (min-width: 640px) {
          .dashboard-grid-secondary {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 768px) {
          .dashboard-grid-primary {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-grid-tools {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .dashboard-container {
            gap: 2rem;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;

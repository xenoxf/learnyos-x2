"use client"

/**
 * ============================================
 * CORE LEARNING STATUS
 * ============================================
 * 
 * Componente que muestra consejos de estudio rotativos.
 * Convertido de Tailwind a CSS puro con animaciones mejoradas.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Zap, Clock, Lightbulb, Target, BookOpen } from 'lucide-react';

const tips = [
  { 
    icon: Brain, 
    text: "La repetición espaciada mejora la memoria a largo plazo", 
    gradient: "linear-gradient(to bottom right, #06b6d4, #2563eb)" 
  },
  { 
    icon: Zap, 
    text: "Estudiar en bloques de 25 minutos aumenta la concentración", 
    gradient: "linear-gradient(to bottom right, #7c3aed, #6d28d9)" 
  },
  { 
    icon: Lightbulb, 
    text: "Enseñar lo aprendido refuerza el conocimiento", 
    gradient: "linear-gradient(to bottom right, #f59e0b, #ea580c)" 
  },
  { 
    icon: Clock, 
    text: "El sueño consolida la memoria y el aprendizaje", 
    gradient: "linear-gradient(to bottom right, #10b981, #14b8a6)" 
  },
  { 
    icon: Target, 
    text: "Establecer metas claras aumenta la motivación", 
    gradient: "linear-gradient(to bottom right, #ec4899, #f43f5e)" 
  },
  { 
    icon: BookOpen, 
    text: "Conectar ideas nuevas con conocimiento previo mejora retención", 
    gradient: "linear-gradient(to bottom right, #6366f1, #7c3aed)" 
  },
];

export const CoreLearningStatus: React.FC = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
        setIsTransitioning(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const tip = tips[currentTip];
  const IconComponent = tip.icon;

  return (
    <>
      <Card className="learning-status-card">
        <CardContent className="learning-status-content">
          <div className={`learning-status-main ${isTransitioning ? 'learning-status-transitioning' : ''}`}>
            {/* Large Animated Icon */}
            <div className="learning-status-icon-wrapper">
              <div 
                className="learning-status-icon"
                style={{ background: tip.gradient }}
              >
                <IconComponent className="learning-status-icon-svg" />
              </div>
              {/* Pulse ring */}
              <div 
                className="learning-status-pulse"
                style={{ background: tip.gradient }}
              />
            </div>

            {/* Content */}
            <div className="learning-status-text">
              <p className="learning-status-label">
                <Lightbulb className="learning-status-label-icon" />
                Consejo de estudio
              </p>
              <p className="learning-status-description">
                {tip.text}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="learning-status-dots">
            {tips.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentTip(idx);
                    setIsTransitioning(false);
                  }, 300);
                }}
                className={`learning-status-dot ${idx === currentTip ? 'learning-status-dot-active' : ''}`}
                aria-label={`Consejo ${idx + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .learning-status-card {
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          background: hsl(var(--card) / 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid hsl(var(--primary) / 0.2);
        }

        .learning-status-card:hover {
          border-color: hsl(var(--primary) / 0.4);
          box-shadow: var(--shadow-lg);
        }

        .learning-status-content {
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .learning-status-main {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .learning-status-transitioning {
          opacity: 0;
          transform: translateY(0.5rem);
        }

        .learning-status-icon-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .learning-status-icon {
          width: 5rem;
          height: 5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-xl);
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .learning-status-card:hover .learning-status-icon {
          transform: scale(1.1);
        }

        .learning-status-icon-svg {
          width: 2.5rem;
          height: 2.5rem;
          color: white;
        }

        .learning-status-pulse {
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          opacity: 0.2;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .learning-status-text {
          flex: 1;
          min-width: 0;
        }

        .learning-status-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(var(--primary));
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .learning-status-label-icon {
          width: 1rem;
          height: 1rem;
        }

        .learning-status-description {
          font-size: 1.125rem;
          font-weight: 500;
          color: hsl(var(--foreground));
          line-height: 1.75;
        }

        .learning-status-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .learning-status-dot {
          height: 0.5rem;
          border-radius: 9999px;
          border: none;
          background-color: hsl(var(--muted-foreground) / 0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0;
        }

        .learning-status-dot:not(.learning-status-dot-active) {
          width: 0.5rem;
        }

        .learning-status-dot:hover:not(.learning-status-dot-active) {
          background-color: hsl(var(--muted-foreground) / 0.5);
        }

        .learning-status-dot-active {
          width: 2rem;
          background-color: hsl(var(--primary));
        }

        @media (max-width: 640px) {
          .learning-status-main {
            flex-direction: column;
            text-align: center;
          }

          .learning-status-icon {
            width: 4rem;
            height: 4rem;
          }

          .learning-status-icon-svg {
            width: 2rem;
            height: 2rem;
          }

          .learning-status-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

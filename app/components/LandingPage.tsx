"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingThemeSelector } from '@/components/LandingThemeSelector';
export const LandingPage: React.FC = () => {
  const router = useRouter();
  const features = [{
    icon: '🤖',
    title: 'Chatbot IA Avanzado',
    description: 'Obtén respuestas instantáneas y explicaciones personalizadas.',
    gradient: 'from-blue-500 to-cyan-500'
  }, {
    icon: '📝',
    title: 'Generador de Quiz',
    description: 'Crea cuestionarios adaptados a tu nivel de estudio.',
    gradient: 'from-green-500 to-emerald-500'
  }, {
    icon: '🃏',
    title: 'Flashcards Inteligentes',
    description: 'Sistema de repetición espaciada para mejor retención.',
    gradient: 'from-purple-500 to-pink-500'
  }, {
    icon: '📚',
    title: 'Generador de Notas',
    description: 'Transforma contenido en notas estructuradas.',
    gradient: 'from-orange-500 to-red-500'
  }, {
    icon: '🌐',
    title: 'Traductor IA',
    description: 'Traduce textos manteniendo el contexto técnico.',
    gradient: 'from-indigo-500 to-purple-500'
  }, {
    icon: '🎯',
    title: 'Aprendizaje Personalizado',
    description: 'Contenido adaptado a tu ritmo y preferencias.',
    gradient: 'from-yellow-500 to-orange-500'
  }];
  const stats = [{
    number: '10,000+',
    label: 'Estudiantes'
  }, {
    number: '500k+',
    label: 'Sesiones'
  }, {
    number: '95%',
    label: 'Mejora'
  }, {
    number: '24/7',
    label: 'Disponible'
  }];
  return <div className="min-h-screen bg-background">
      {/* Header - not fixed on mobile */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:sticky lg:top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 focus-gradient rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">L</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold focus-gradient-text">LearnyOS</span>
                <div className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Powered by AI</div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <LandingThemeSelector />
              <Button variant="outline" onClick={() => router.push('/auth')} className="hidden sm:inline-flex text-sm">
                Iniciar Sesión
              </Button>
              <Button className="focus-gradient text-white shadow-lg hover:shadow-xl transition-all text-sm px-3 sm:px-4" onClick={() => router.push('/auth')}>
                <span className="hidden sm:inline">Comenzar Gratis</span>
                <span className="sm:hidden">Comenzar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                  🚀 Revolución en el Aprendizaje con IA
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                  Aprende más rápido con{' '}
                  <span className="focus-gradient-text">LearnyOS</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
                  La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas para maximizar tu aprendizaje.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button className="focus-gradient text-white text-base sm:text-lg px-6 py-5 shadow-lg hover:shadow-xl transition-all" size="lg" onClick={() => router.push('/auth')}>
                  Comenzar Ahora - Gratis
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-3 sm:gap-6 pt-4">
                {stats.map((stat, index) => <div key={index} className="text-center">
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold focus-gradient-text">{stat.number}</div>
                    <div className="text-[10px] sm:text-sm text-muted-foreground">{stat.label}</div>
                  </div>)}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl p-6 border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full w-1/2"></div>
                    <div className="h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full w-5/6"></div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <div className="h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📚</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              Herramientas Potenciadas por IA
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Cada función está diseñada para acelerar tu aprendizaje y hacer que estudiar sea más efectivo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-xl sm:text-2xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 sm:py-6 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 focus-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">L</span>
            </div>
            <span className="text-base sm:text-lg font-bold focus-gradient-text">LearnyOS</span>
          </div>
          
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            © {new Date().getFullYear()} LearnyOS. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>;
};
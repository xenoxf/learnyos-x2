
"use client"

import { useState, useEffect } from 'react';

interface LanguageConfig {
  code: string;
  name: string;
  rtl: boolean;
  translations: Record<string, string>;
}

const languages: Record<string, LanguageConfig> = {
  es: {
    code: 'es',
    name: 'Español',
    rtl: false,
    translations: {
      'dashboard': 'Dashboard',
      'chat': 'Chat IA',
      'quiz': 'Generador de Quiz',
      'flashcards': 'Creador de Flashcards',
      'notes': 'Generador de Notas',
      'study_time': 'Tiempo de Estudio',
      'level': 'Nivel',
      'welcome': '¡Bienvenido a FocusOS!',
      'study_tools': 'Herramientas de Estudio',
      'weekly_progress': 'Progreso Semanal',
      'pomodoro': 'Temporizador Pomodoro',
      'start': 'Comenzar',
      'pause': 'Pausar',
      'reset': 'Reiniciar',
      'settings': 'Configuración',
      'generate': 'Generar',
      'loading': 'Cargando...',
      'today': 'Hoy',
      'total': 'Total'
    }
  },
  en: {
    code: 'en',
    name: 'English',
    rtl: false,
    translations: {
      'dashboard': 'Dashboard',
      'chat': 'AI Chat',
      'quiz': 'Quiz Generator',
      'flashcards': 'Flashcard Creator',
      'notes': 'Notes Generator',
      'study_time': 'Study Time',
      'level': 'Level',
      'welcome': 'Welcome to FocusOS!',
      'study_tools': 'Study Tools',
      'weekly_progress': 'Weekly Progress',
      'pomodoro': 'Pomodoro Timer',
      'start': 'Start',
      'pause': 'Pause',
      'reset': 'Reset',
      'settings': 'Settings',
      'generate': 'Generate',
      'loading': 'Loading...',
      'today': 'Today',
      'total': 'Total'
    }
  },
  fr: {
    code: 'fr',
    name: 'Français',
    rtl: false,
    translations: {
      'dashboard': 'Tableau de bord',
      'chat': 'Chat IA',
      'quiz': 'Générateur de Quiz',
      'flashcards': 'Créateur de Cartes',
      'notes': 'Générateur de Notes',
      'study_time': 'Temps d\'étude',
      'level': 'Niveau',
      'welcome': 'Bienvenue sur FocusOS!',
      'study_tools': 'Outils d\'étude',
      'weekly_progress': 'Progrès hebdomadaire',
      'pomodoro': 'Minuteur Pomodoro',
      'start': 'Commencer',
      'pause': 'Pause',
      'reset': 'Réinitialiser',
      'settings': 'Paramètres',
      'generate': 'Générer',
      'loading': 'Chargement...',
      'today': 'Aujourd\'hui',
      'total': 'Total'
    }
  }
};

export const useSmartLanguageDetection = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('es');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('es');
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);

  // Detectar idioma del navegador
  useEffect(() => {
    const detectBrowserLanguage = () => {
      const browserLang = navigator.language.split('-')[0];
      if (languages[browserLang]) {
        setDetectedLanguage(browserLang);
        if (isAutoDetecting) {
          setCurrentLanguage(browserLang);
        }
      }
    };

    detectBrowserLanguage();

    // Detectar cambios en el idioma del sistema
    window.addEventListener('languagechange', detectBrowserLanguage);
    return () => window.removeEventListener('languagechange', detectBrowserLanguage);
  }, [isAutoDetecting]);

  // Detectar idioma del contenido que escribe el usuario
  const detectContentLanguage = (text: string): string => {
    const spanishWords = ['que', 'con', 'para', 'por', 'como', 'pero', 'hasta', 'desde', 'cuando', 'donde'];
    const englishWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her'];
    const frenchWords = ['que', 'avec', 'pour', 'par', 'comme', 'mais', 'jusqu', 'depuis', 'quand', 'où'];

    const words = text.toLowerCase().split(/\s+/);
    
    const spanishScore = words.filter(word => spanishWords.includes(word)).length;
    const englishScore = words.filter(word => englishWords.includes(word)).length;
    const frenchScore = words.filter(word => frenchWords.includes(word)).length;

    if (spanishScore > englishScore && spanishScore > frenchScore) return 'es';
    if (englishScore > frenchScore) return 'en';
    if (frenchScore > 0) return 'fr';
    
    return detectedLanguage;
  };

  const translate = (key: string): string => {
    return languages[currentLanguage]?.translations[key] || key;
  };

  const changeLanguage = (languageCode: string) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
      setIsAutoDetecting(false);
      localStorage.setItem('focusOS_language', languageCode);
      
      // Aplicar dirección RTL si es necesario
      document.dir = languages[languageCode].rtl ? 'rtl' : 'ltr';
    }
  };

  const enableAutoDetection = () => {
    setIsAutoDetecting(true);
    setCurrentLanguage(detectedLanguage);
    localStorage.removeItem('focusOS_language');
  };

  // Cargar idioma guardado al iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('focusOS_language');
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
      setIsAutoDetecting(false);
    }
  }, []);

  return {
    currentLanguage,
    detectedLanguage,
    isAutoDetecting,
    availableLanguages: Object.values(languages),
    translate,
    changeLanguage,
    enableAutoDetection,
    detectContentLanguage
  };
};

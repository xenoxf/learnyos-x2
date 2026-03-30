'use client';

/**
 * 🎣 Hook para transformar contenido educativo
 * Integra el motor de transformación mágico con los componentes
 */

import { contentTransformer } from '@/services/content-transformer';
import { useState, useCallback } from 'react';

interface TransformResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function useContentTransformer() {
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transforma respuesta de examen
   */
  const transformExam = useCallback((examData: any) => {
    try {
      setIsTransforming(true);
      setError(null);
      return contentTransformer.transformExam(examData);
    } catch (error) {
      setError('Error transformando examen');
      return '';
    } finally {
      setIsTransforming(false);
    }
  }, []);

  /**
   * Transforma respuesta de flashcards
   */
  const transformFlashcards = useCallback((flashcardData: any) => {
    try {
      setIsTransforming(true);
      setError(null);
      return contentTransformer.transformFlashcards(flashcardData);
    } catch (error) {
      setError('Error transformando flashcards');
      return '';
    } finally {
      setIsTransforming(false);
    }
  }, []);

  /**
   * Transforma respuesta de notas
   */
  const transformNotes = useCallback((noteData: any) => {
    try {
      setIsTransforming(true);
      setError(null);
      return contentTransformer.transformNotes(noteData);
    } catch (error) {
      setError('Error transformando notas');
      return '';
    } finally {
      setIsTransforming(false);
    }
  }, []);

  /**
   * Transforma contenido genérico
   */
  const transformContent = useCallback(
    (data: any, type: 'exam' | 'flashcard' | 'note' | 'summary' = 'note') => {
      try {
        setIsTransforming(true);
        setError(null);
        return contentTransformer.transformToMarkdown(data, type);
      } catch (error) {
        setError('Error transformando contenido');
        return '';
      } finally {
        setIsTransforming(false);
      }
    },
    []
  );

  /**
   * Exporta a archivo
   */
  const exportMarkdown = useCallback((markdown: string, filename: string) => {
    try {
      contentTransformer.exportToFile(markdown, filename);
    } catch (error) {
      // Silently handle export errors
    }
  }, []);

  /**
   * Copia al portapapeles
   */
  const copyToClipboard = useCallback(
    async (markdown: string) => {
      try {
        return await contentTransformer.copyToClipboard(markdown);
      } catch (error) {
        return false;
      }
    },
    []
  );

  /**
   * Transforma a Markdown genérico (alias para transformContent)
   */
  const transformToMarkdown = useCallback(
    (data: any, type: 'exam' | 'flashcard' | 'note' | 'summary' = 'summary') => {
      try {
        if (typeof data === 'string') {
          return data;
        }
        return contentTransformer.transformToMarkdown(data, type);
      } catch (error) {
        return typeof data === 'string' ? data : JSON.stringify(data);
      }
    },
    []
  );

  const transformMarkdown = useCallback(
    (content: string): TransformResult => {
      try {
        setIsTransforming(true);
        setError(null);

        if (!content || typeof content !== 'string') {
          return {
            success: false,
            error: 'Contenido inválido',
          };
        }

        // Aquí iría la lógica de transformación
        return {
          success: true,
          data: content,
        };
      } catch (err: any) {
        const errorMsg = err?.message || 'Error en transformación';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsTransforming(false);
      }
    },
    []
  );

  const transformHTML = useCallback(
    (content: string): TransformResult => {
      try {
        setIsTransforming(true);
        setError(null);

        if (!content || typeof content !== 'string') {
          return {
            success: false,
            error: 'Contenido inválido',
          };
        }

        return {
          success: true,
          data: content,
        };
      } catch (err: any) {
        const errorMsg = err?.message || 'Error en transformación';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsTransforming(false);
      }
    },
    []
  );

  return {
    transformExam,
    transformFlashcards,
    transformNotes,
    transformContent,
    transformToMarkdown,
    exportMarkdown,
    copyToClipboard,
    transformMarkdown,
    transformHTML,
    isTransforming,
    error,
  };
}
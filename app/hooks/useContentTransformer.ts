'use client';

/**
 * 🎣 Hook para transformar contenido educativo
 * Integra el motor de transformación mágico con los componentes
 */

import { contentTransformer } from '@/services/content-transformer';

export function useContentTransformer() {
  /**
   * Transforma respuesta de examen
   */
  const transformExam = (examData: any) => {
    try {
      return contentTransformer.transformExam(examData);
    } catch (error) {
      console.error('Error transformando examen:', error);
      return '';
    }
  };

  /**
   * Transforma respuesta de flashcards
   */
  const transformFlashcards = (flashcardData: any) => {
    try {
      return contentTransformer.transformFlashcards(flashcardData);
    } catch (error) {
      console.error('Error transformando flashcards:', error);
      return '';
    }
  };

  /**
   * Transforma respuesta de notas
   */
  const transformNotes = (noteData: any) => {
    try {
      return contentTransformer.transformNotes(noteData);
    } catch (error) {
      console.error('Error transformando notas:', error);
      return '';
    }
  };

  /**
   * Transforma contenido genérico
   */
  const transformContent = (data: any, type: 'exam' | 'flashcard' | 'note' | 'summary' = 'note') => {
    try {
      return contentTransformer.transformToMarkdown(data, type);
    } catch (error) {
      console.error('Error transformando contenido:', error);
      return '';
    }
  };

  /**
   * Exporta a archivo
   */
  const exportMarkdown = (markdown: string, filename: string) => {
    try {
      contentTransformer.exportToFile(markdown, filename);
    } catch (error) {
      console.error('Error exportando archivo:', error);
    }
  };

  /**
   * Copia al portapapeles
   */
  const copyToClipboard = async (markdown: string) => {
    try {
      return await contentTransformer.copyToClipboard(markdown);
    } catch (error) {
      console.error('Error copiando:', error);
      return false;
    }
  };

  /**
   * Transforma a Markdown genérico (alias para transformContent)
   */
  const transformToMarkdown = (data: any, type: 'exam' | 'flashcard' | 'note' | 'summary' = 'summary') => {
    try {
      if (typeof data === 'string') {
        return data;
      }
      return contentTransformer.transformToMarkdown(data, type);
    } catch (error) {
      console.error('Error transformando a markdown:', error);
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  };

  return {
    transformExam,
    transformFlashcards,
    transformNotes,
    transformContent,
    transformToMarkdown,
    exportMarkdown,
    copyToClipboard,
  };
}
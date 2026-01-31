// utils/markdown-formatter.ts - UTILIDAD PURA (no componente)
import type {
  Exam,
  ExamQuestion,
  Card,
  FlashCard,
  Note,
  Difficulty,
  Chat
} from '@/types';

export class MarkdownFormatter {
  // ==================== FORMATO EXAMEN ====================

  static formatExam(exam: Exam, questions?: ExamQuestion[]): string {
    const difficultyEmoji = this.getDifficultyEmoji(exam.difficulty as Difficulty);

    let markdown = `# ${exam.title || 'Examen'}\n\n`;

    if (exam.description) {
      markdown += `**${exam.description}**\n\n`;
    }

    markdown += `## 📊 Información del Examen\n`;
    markdown += `- **Total de preguntas:** ${exam.totalQuestions || 0}\n`;
    markdown += `- **Dificultad:** ${difficultyEmoji} ${exam.difficulty || 'medio'}\n`;
    markdown += `- **Fecha de creación:** ${new Date(exam.createdAt).toLocaleDateString()}\n`;

    if (questions && questions.length > 0) {
      markdown += `\n---\n\n`;
      markdown += `## ❓ Preguntas\n\n`;

      questions.forEach((question, index) => {
        markdown += `### Pregunta ${index + 1}\n`;
        markdown += `${question.question}\n\n`;

        if (question.options && question.options.length > 0) {
          markdown += `**Opciones:**\n`;
          question.options.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
            const correctMark = option.isCorrect ? '✅' : '  ';
            markdown += `${correctMark} **${letter}.** ${option.text}\n`;
          });
        }

        if (question.correctAnswer) {
          markdown += `\n**Respuesta correcta:** ${question.correctAnswer}\n`;
        }

        markdown += `\n---\n\n`;
      });
    }

    // Resumen
    markdown += `## 📋 Resumen\n`;
    markdown += `Este examen contiene ${exam.totalQuestions || 0} preguntas de ${exam.difficulty || 'medio'} dificultad.\n`;
    markdown += `\n**Consejos:**\n`;
    markdown += `- Lee cada pregunta cuidadosamente\n`;
    markdown += `- Elimina las opciones incorrectas primero\n`;
    markdown += `- Gestiona tu tiempo eficientemente\n`;

    return markdown;
  }

  // ==================== FORMATO FLASHCARDS ====================

  static formatFlashcards(card: Card, flashcards?: FlashCard[]): string {
    let markdown = `# 🃏 ${card.title || 'Flashcards'}\n\n`;

    if (card.description) {
      markdown += `${card.description}\n\n`;
    }

    markdown += `## 📊 Estadísticas\n`;
    markdown += `- **Total de tarjetas:** ${card.totalCards || 0}\n`;
    markdown += `- **Tarjetas revisadas:** ${card.reviewedCards || 0}\n`;

    if (card.lastReviewDate) {
      markdown += `- **Última revisión:** ${new Date(card.lastReviewDate).toLocaleDateString()}\n`;
    }

    if (flashcards && flashcards.length > 0) {
      // Calcular distribución de dificultad
      const difficultyCount = { easy: 0, medium: 0, hard: 0 };
      flashcards.forEach(f => {
        if (f.difficulty && difficultyCount.hasOwnProperty(f.difficulty)) {
          difficultyCount[f.difficulty]++;
        }
      });

      markdown += `- **Distribución:** 🟢 ${difficultyCount.easy} | 🟡 ${difficultyCount.medium} | 🔴 ${difficultyCount.hard}\n`;

      markdown += `\n---\n\n`;
      markdown += `## 🃏 Tarjetas\n\n`;

      flashcards.forEach((flashcard, index) => {
        const difficultyEmoji = this.getDifficultyEmoji(flashcard.difficulty);

        markdown += `### Tarjeta ${index + 1}\n`;
        markdown += `${difficultyEmoji} **Dificultad:** ${flashcard.difficulty}\n\n`;
        markdown += `**❓ Pregunta:**\n${flashcard.question}\n\n`;
        markdown += `**✅ Respuesta:**\n${flashcard.answer}\n\n`;

        if (flashcard.hint) {
          markdown += `**💡 Pista:** ${flashcard.hint}\n\n`;
        }

        if (flashcard.tags && flashcard.tags.length > 0) {
          markdown += `**🏷️ Etiquetas:** ${flashcard.tags.join(', ')}\n\n`;
        }

        markdown += `---\n\n`;
      });
    }

    // Consejos de estudio
    markdown += `## 🎯 Consejos de Estudio\n`;
    markdown += `1. **Repaso espaciado:** Revisa las tarjetas en intervalos crecientes\n`;
    markdown += `2. **Active recall:** Intenta recordar antes de voltear la tarjeta\n`;
    markdown += `3. **Metacognición:** Evalúa tu confianza en cada respuesta\n`;
    markdown += `4. **Enfoque en difíciles:** Dedica más tiempo a las tarjetas rojas\n`;

    return markdown;
  }

  // ==================== FORMATO NOTAS ====================

  static formatNote(note: Note): string {
    let markdown = `# 📝 ${note.title || 'Nota'}\n\n`;

    markdown += `**Fecha de creación:** ${new Date(note.createdAt).toLocaleDateString()}\n\n`;

    if (note.color) {
      markdown += `**Color:** ${note.color}\n\n`;
    }

    if (note.content) {
      // Dividir contenido en párrafos
      const paragraphs = note.content.split('\n').filter(p => p.trim());

      paragraphs.forEach(paragraph => {
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          markdown += `${paragraph}\n`;
        } else if (paragraph.match(/^\d+\./)) {
          markdown += `${paragraph}\n`;
        } else {
          markdown += `${paragraph}\n\n`;
        }
      });
    }

    if (note.tags && note.tags.length > 0) {
      markdown += `\n**🏷️ Etiquetas:** ${note.tags.join(', ')}\n`;
    }

    // Plantilla para tomar notas
    markdown += `\n---\n\n`;
    markdown += `## 📋 Plantilla para Continuar\n`;
    markdown += `### Puntos clave:\n`;
    markdown += `- \n- \n- \n\n`;
    markdown += `### Dudas o preguntas:\n`;
    markdown += `- \n- \n\n`;
    markdown += `### Para investigar más:\n`;
    markdown += `- \n`;

    return markdown;
  }

  // ==================== FORMATO CHAT ====================

  static formatChat(chat: Chat): string {
    let markdown = `# 💬 ${chat.title || 'Conversación'}\n\n`;

    markdown += `**Fecha:** ${new Date(chat.createdAt).toLocaleDateString()}\n`;
    markdown += `**Total de mensajes:** ${chat.messages?.length || 0}\n\n`;
    markdown += `---\n\n`;

    if (chat.messages && chat.messages.length > 0) {
      chat.messages.forEach((message, index) => {
        const isUser = message.userId !== undefined;
        const prefix = isUser ? '👤 **Tú:**' : '🤖 **IA:**';

        markdown += `### Mensaje ${index + 1}\n`;
        markdown += `${prefix}\n`;
        markdown += `${message.prompt || message.response}\n\n`;

        if (!isUser && message.response) {
          // Formatear respuesta de IA
          const cleanResponse = message.response
            .replace(/```[\s\S]*?```/g, '\n```\n...código...\n```\n') // Acortar bloques de código
            .replace(/\n\s*\n/g, '\n\n'); // Limpiar espacios

          markdown += `${cleanResponse}\n\n`;
        }

        markdown += `---\n\n`;
      });
    }

    // Resumen de la conversación
    markdown += `## 📊 Resumen de la Conversación\n`;
    markdown += `Esta conversación contiene ${chat.messages?.length || 0} mensajes intercambiados.\n\n`;
    markdown += `**Temas principales:**\n`;
    markdown += `- (Identifica los temas principales de la conversación)\n\n`;
    markdown += `**Conclusiones:**\n`;
    markdown += `- (Anota las conclusiones o aprendizajes)\n`;

    return markdown;
  }

  // ==================== UTILIDADES ====================

  private static getDifficultyEmoji(difficulty: Difficulty | string): string {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  }

  // ==================== FUNCIONES DE EXPORTACIÓN ====================

  static downloadMarkdown(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${this.sanitizeFilename(filename)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }

  static shareContent(title: string, text: string): void {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text.substring(0, 100) + '...',
        url: window.location.href
      }).catch(err => {
        console.log('Error al compartir:', err);
        this.copyToClipboard(text).then(() => {
          alert('Contenido copiado al portapapeles');
        });
      });
    } else {
      this.copyToClipboard(text).then(() => {
        alert('Contenido copiado al portapapeles');
      });
    }
  }

  private static sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // ==================== PARSER DE IA RESPONSE ====================

  /**
   * Convierte la respuesta JSON de la IA a Markdown
   * Útil para los endpoints de generación automática
   */
  static parseAIResponseToMarkdown(aiResponse: any, type: 'exam' | 'flashcards' | 'notes'): string {
    if (!aiResponse || aiResponse.error) {
      return '# ⚠️ Error\n\nNo se pudo generar el contenido solicitado.';
    }

    try {
      switch (type) {
        case 'exam':
          return this.formatExamFromAI(aiResponse);
        case 'flashcards':
          return this.formatFlashcardsFromAI(aiResponse);
        case 'notes':
          return this.formatNotesFromAI(aiResponse);
        default:
          return '# Contenido Generado\n\n' + JSON.stringify(aiResponse, null, 2);
      }
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
      return '# ⚠️ Error de Formato\n\nLa IA devolvió un formato inesperado.';
    }
  }

  private static formatExamFromAI(aiResponse: any): string {
    let markdown = `# ${aiResponse.title || 'Examen Generado'}\n\n`;
    markdown += `${aiResponse.description || ''}\n\n`;
    markdown += `**Total de preguntas:** ${aiResponse.totalQuestions || 0}\n`;
    markdown += `**Tiempo estimado:** ${aiResponse.estimatedTime || '30-45 minutos'}\n\n`;

    if (aiResponse.questions && Array.isArray(aiResponse.questions)) {
      aiResponse.questions.forEach((q: any, i: number) => {
        markdown += `## Pregunta ${i + 1}\n`;
        markdown += `${q.question}\n\n`;

        if (q.options && Array.isArray(q.options)) {
          markdown += `**Opciones:**\n`;
          q.options.forEach((opt: any, optIndex: number) => {
            const letter = String.fromCharCode(65 + optIndex);
            const correct = opt.isCorrect ? '✅' : '  ';
            markdown += `${correct} **${letter}.** ${opt.text}\n`;
          });
        }

        if (q.explanation) {
          markdown += `\n**💡 Explicación:** ${q.explanation}\n`;
        }

        markdown += `\n---\n\n`;
      });
    }

    return markdown;
  }

  private static formatFlashcardsFromAI(aiResponse: any): string {
    let markdown = `# 🃏 Flashcards Generadas\n\n`;

    if (aiResponse.topic) {
      markdown += `**Tema:** ${aiResponse.topic}\n\n`;
    }

    if (aiResponse.cards && Array.isArray(aiResponse.cards)) {
      aiResponse.cards.forEach((card: any, i: number) => {
        const difficultyEmoji = this.getDifficultyEmoji(card.difficulty);

        markdown += `## Flashcard ${i + 1}\n`;
        markdown += `${difficultyEmoji} **Dificultad:** ${card.difficulty || 'medium'}\n\n`;
        markdown += `**❓ Frente:**\n${card.front}\n\n`;
        markdown += `**✅ Reverso:**\n${card.back}\n\n`;

        if (card.hint) {
          markdown += `**💡 Pista:** ${card.hint}\n\n`;
        }

        markdown += `---\n\n`;
      });
    }

    return markdown;
  }

  private static formatNotesFromAI(aiResponse: any): string {
    let markdown = `# 📝 Notas Generadas\n\n`;

    if (aiResponse.topic) {
      markdown += `**Tema:** ${aiResponse.topic}\n\n`;
    }

    if (aiResponse.notes && Array.isArray(aiResponse.notes)) {
      aiResponse.notes.forEach((note: any, i: number) => {
        markdown += `## ${note.title || `Nota ${i + 1}`}\n\n`;

        if (note.contents && Array.isArray(note.contents)) {
          note.contents.forEach((content: any) => {
            switch (content.type) {
              case 'text':
                markdown += `${content.content}\n\n`;
                break;
              case 'definition':
                markdown += `**📖 Definición:** ${content.content}\n\n`;
                break;
              case 'list':
                if (Array.isArray(content.content)) {
                  content.content.forEach((item: string) => {
                    markdown += `- ${item}\n`;
                  });
                  markdown += '\n';
                }
                break;
            }
          });
        }

        markdown += `---\n\n`;
      });
    }

    return markdown;
  }
}

export default MarkdownFormatter;

'use client';

/**
 * 🎨 MOTOR DE TRANSFORMACIÓN MÁGICO
 * Convierte JSON educativo en Markdown hermoso y premium
 * Añade emojis, estadísticas, tablas y formato visual profesional
 */

interface ContentStats {
  difficulty?: 'fácil' | 'media' | 'difícil';
  estimatedTime?: number;
  topicCount?: number;
  questionCount?: number;
}

interface ContentData {
  title?: string;
  description?: string;
  content?: string;
  topics?: string[];
  questions?: Array<{ question: string; answer: string; difficulty?: string }>;
  summary?: string;
  keyPoints?: string[];
  examples?: string[];
  stats?: ContentStats;
  [key: string]: any;
}

interface ExamTransformData {
  title?: string;
  description?: string;
  difficulty?: "fácil" | "media" | "difícil";
  duration?: number;
  questions?: Array<{ question: string; answer: string; difficulty?: string }>;
  summary?: string;
  topics?: string[];
  instructions?: string;
}

interface FlashcardTransformData {
  title?: string;
  description?: string;
  summary?: string;
  keyPoints?: string[];
  cards?: Array<{ front: string; back: string }>;
}

interface NoteTransformData {
  title?: string;
  description?: string;
  summary?: string;
  keyPoints?: string[];
  content?: string;
  topics?: string[];
  examples?: string[];
}

class ContentTransformer {
  private emojiMap = {
    facil: "🟢",
    media: "🟡",
    dificil: "🔴",
    time: "⏱️",
    topics: "📚",
    questions: "❓",
    summary: "📝",
    tips: "💡",
    examples: "📋",
    code: "💻",
    table: "📊",
    warning: "⚠️",
    success: "✅",
    info: "ℹ️",
  };

  /**
   * Transforma JSON en Markdown premium
   */
  transformToMarkdown(
    data: ContentData,
    contentType: "exam" | "flashcard" | "note" | "summary" = "note",
  ): string {
    let markdown = "";

    // Encabezado principal
    if (data.title) {
      markdown += this.createHeader(data.title, 1);
      markdown += "\n";
    }

    // Descripción
    if (data.description) {
      markdown += `> ${data.description}\n\n`;
    }

    // Stats Banner
    if (data.stats) {
      markdown += this.createStatsBanner(data.stats);
      markdown += "\n";
    }

    // Resumen rápido
    if (data.summary) {
      markdown += this.createSection("📝 Resumen Rápido", data.summary);
      markdown += "\n";
    }

    // Puntos clave
    if (data.keyPoints && data.keyPoints.length > 0) {
      markdown += this.createKeyPoints(data.keyPoints);
      markdown += "\n";
    }

    // Contenido principal
    if (data.content) {
      markdown += this.formatContent(data.content);
      markdown += "\n";
    }

    // Tópicos
    if (data.topics && data.topics.length > 0) {
      markdown += this.createTopicsSection(data.topics);
      markdown += "\n";
    }

    // Preguntas
    if (data.questions && data.questions.length > 0) {
      markdown += this.createQuestionsSection(data.questions);
      markdown += "\n";
    }

    // Ejemplos
    if (data.examples && data.examples.length > 0) {
      markdown += this.createExamplesSection(data.examples);
      markdown += "\n";
    }

    // Footer de recursos
    markdown += this.createFooter();

    return markdown.trim();
  }

  /**
   * Crea encabezado con emojis
   */
  private createHeader(text: string, level: number = 1): string {
    const hashes = "#".repeat(level);
    const emoji = this.getEmojiForType(text.toLowerCase());
    return `${hashes} ${emoji} ${text}`;
  }

  /**
   * Banner de estadísticas visualmente atractivo
   */
  private createStatsBanner(stats: ContentStats): string {
    let banner = "---\n";
    banner += "### 📊 Estadísticas\n\n";
    banner += "| Métrica | Valor |\n";
    banner += "|---------|-------|\n";

    if (stats.difficulty) {
      const diffEmoji = this.getDifficultyEmoji(stats.difficulty);
      banner += `| Dificultad | ${diffEmoji} ${stats.difficulty.charAt(0).toUpperCase() + stats.difficulty.slice(1)} |\n`;
    }

    if (stats.estimatedTime) {
      banner += `| ⏱️ Tiempo estimado | ${stats.estimatedTime} min |\n`;
    }

    if (stats.topicCount) {
      banner += `| 📚 Tópicos | ${stats.topicCount} |\n`;
    }

    if (stats.questionCount) {
      banner += `| ❓ Preguntas | ${stats.questionCount} |\n`;
    }

    banner += "\n---\n";
    return banner;
  }

  /**
   * Crea sección con puntos clave
   */
  private createKeyPoints(points: string[]): string {
    let section = "### 🎯 Puntos Clave\n\n";
    points.forEach((point) => {
      section += `- ✨ ${point}\n`;
    });
    return section;
  }

  /**
   * Crea sección de tópicos
   */
  private createTopicsSection(topics: string[]): string {
    let section = "### 📚 Tópicos Cubiertos\n\n";

    topics.forEach((topic, index) => {
      section += `${index + 1}. **${topic}**\n`;
    });

    return section;
  }

  /**
   * Crea sección de preguntas con respuestas
   */
  private createQuestionsSection(
    questions: Array<{ question: string; answer: string; difficulty?: string }>,
  ): string {
    let section = "### ❓ Preguntas de Estudio\n\n";

    questions.forEach((q, index) => {
      const diffEmoji = q.difficulty ? this.getDifficultyEmoji(q.difficulty) : "";
      section += `#### Pregunta ${index + 1} ${diffEmoji}\n\n`;
      section += `**Q:** ${q.question}\n\n`;
      section += `**A:** ${q.answer}\n\n`;
      section += "---\n\n";
    });

    return section;
  }

  /**
   * Crea sección de ejemplos
   */
  private createExamplesSection(examples: string[]): string {
    let section = "### 📋 Ejemplos Prácticos\n\n";

    examples.forEach((example, index) => {
      section += `#### Ejemplo ${index + 1}\n\n`;
      section += `\`\`\`\n${example}\n\`\`\`\n\n`;
    });

    return section;
  }

  /**
   * Crea una sección genérica
   */
  private createSection(title: string, content: string): string {
    return `### ${title}\n\n${content}\n`;
  }

  /**
   * Formatea contenido con estructura mejorada
   */
  private formatContent(content: string): string {
    // Si contiene código, preservar bloques
    if (content.includes("```")) {
      return content;
    }

    // Dividir por líneas y formatear
    const lines = content.split("\n");
    let formatted = "";

    lines.forEach((line) => {
      if (line.startsWith("##")) {
        formatted += `\n${line}\n`;
      } else if (line.startsWith("-") || line.startsWith("*")) {
        formatted += `${line}\n`;
      } else if (line.trim()) {
        formatted += `${line}\n`;
      }
    });

    return formatted;
  }

  /**
   * Obtiene emoji según tipo de contenido
   */
  private getEmojiForType(type: string): string {
    if (type.includes("exam") || type.includes("examen")) return "📝";
    if (type.includes("flashcard") || type.includes("tarjeta")) return "🎴";
    if (type.includes("note") || type.includes("nota")) return "📓";
    if (type.includes("summary") || type.includes("resumen")) return "📋";
    if (type.includes("code") || type.includes("código")) return "💻";
    if (type.includes("table") || type.includes("tabla")) return "📊";
    return "📚";
  }

  /**
   * Obtiene emoji de dificultad
   */
  private getDifficultyEmoji(difficulty: string): string {
    const diff = difficulty.toLowerCase();
    if (diff.includes("fácil") || diff.includes("easy")) return "🟢";
    if (diff.includes("media") || diff.includes("medium")) return "🟡";
    if (diff.includes("difícil") || diff.includes("hard")) return "🔴";
    return "⚪";
  }

  /**
   * Footer con recursos y opciones
   */
  private createFooter(): string {
    let footer = "\n---\n\n";
    footer += "### 📚 Recursos Adicionales\n\n";
    footer += "- 💾 Descarga este contenido como `.md`\n";
    footer += "- 📤 Comparte con compañeros\n";
    footer += "- 🔄 Revisa regularmente\n";
    footer += "- ⭐ Marca puntos importantes\n\n";
    footer += "**Generado con ❤️ por LearnYos IA**\n";

    return footer;
  }

  /**
   * Transforma respuesta de examen
   */
  transformExam(examData: ExamTransformData): string {
    return this.transformToMarkdown(
      {
        title: examData.title || "Examen Generado",
        description: examData.description,
        stats: {
          difficulty: examData.difficulty,
          estimatedTime: examData.duration || 60,
          questionCount: examData.questions?.length || 0,
        },
        summary: examData.summary,
        keyPoints: examData.topics,
        questions: examData.questions,
        content: examData.instructions,
      },
      "exam",
    );
  }

  /**
   * Transforma respuesta de flashcards
   */
  transformFlashcards(flashcardData: FlashcardTransformData): string {
    return this.transformToMarkdown(
      {
        title: flashcardData.title || "Tarjetas de Estudio",
        description: flashcardData.description,
        stats: {
          topicCount: flashcardData.cards?.length || 0,
        },
        summary: flashcardData.summary,
        keyPoints: flashcardData.keyPoints,
        questions: flashcardData.cards?.map((card) => ({
          question: card.front,
          answer: card.back,
        })),
      },
      "flashcard",
    );
  }

  /**
   * Transforma respuesta de notas
   */
  transformNotes(noteData: NoteTransformData): string {
    return this.transformToMarkdown(
      {
        title: noteData.title || "Notas de Estudio",
        description: noteData.description,
        summary: noteData.summary,
        keyPoints: noteData.keyPoints,
        content: noteData.content,
        topics: noteData.topics,
        examples: noteData.examples,
      },
      "note",
    );
  }

  /**
   * Exporta Markdown a archivo
   */
  exportToFile(markdown: string, filename: string = 'contenido.md'): void {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Copia Markdown al portapapeles
   */
  async copyToClipboard(markdown: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(markdown);
      return true;
    } catch (err) {
      console.error('Error al copiar:', err);
      return false;
    }
  }
}

export const contentTransformer = new ContentTransformer();
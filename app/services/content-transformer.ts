/**
 * Content Transformer Utility
 * Handles decoding of Base64 content from the backend
 */

export const contentTransformer = {
  /**
   * Decodes a Base64 string back to UTF-8
   */
  decode(base64: string | null | undefined): string {
    if (!base64) return "";
    
    try {
      // Decode Base64 to binary string
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      // Decode binary to UTF-8 string
      return new TextDecoder().decode(bytes);
    } catch (e) {
      // If it's not valid base64 or other error, return as is
      return base64 || "";
    }
  },

  /**
   * Specifically transforms an exam structure
   */
  transformExam(exam: any): any {
    if (!exam) return exam;
    return {
      ...exam,
      questions: exam.questions?.map((q: any) => ({
        ...q,
        question: this.decode(q.question),
        explanation: this.decode(q.explanation),
        contextContent: this.decode(q.contextContent),
        options: q.options?.map((o: any) => ({
          ...o,
          text: this.decode(o.text),
          feedback: this.decode(o.feedback)
        }))
      }))
    };
  },

  /**
   * Specifically transforms a note structure or array of notes
   */
  transformNotes(data: any): any {
    if (!data) return data;
    if (Array.isArray(data)) {
      return data.map(note => this.transformNote(note));
    }
    return this.transformNote(data);
  },

  /**
   * Specifically transforms a note structure
   */
  transformNote(note: any): any {
    if (!note) return note;
    return {
      ...note,
      title: this.decode(note.title),
      content: this.decode(note.content),
      topic: this.decode(note.topic)
    };
  },

  /**
   * Specifically transforms a flashcard deck structure
   */
  transformFlashcards(deck: any): any {
    if (!deck) return deck;
    return {
      ...deck,
      flashcards: deck.flashcards?.map((f: any) => ({
        ...f,
        front: this.decode(f.front),
        back: this.decode(f.back),
        hint: this.decode(f.hint)
      }))
    };
  },

  /**
   * Transforms complex data structures into a markdown-friendly format
   */
  transformToMarkdown(data: any, type: string): string {
    if (!data) return "";
    
    // For single fields or already decoded strings
    if (typeof data === 'string' && !data.includes('{')) {
      return this.decode(data);
    }

    // For specific objects, transform and then maybe stringify or return key field
    switch (type) {
      case 'note':
        const note = this.transformNote(data);
        return note.content || "";
      case 'exam':
        const exam = this.transformExam(data);
        return JSON.stringify(exam);
      case 'flashcards':
      case 'flashcard':
        const deck = this.transformFlashcards(data);
        return JSON.stringify(deck);
      case 'summary':
        return typeof data === 'string' ? this.decode(data) : JSON.stringify(data);
      default:
        return typeof data === 'string' ? this.decode(data) : JSON.stringify(data);
    }
  },

  /**
   * Triggers a browser download for a text file
   */
  exportToFile(content: string, filename: string): void {
    if (typeof window === 'undefined') return;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Copies text to the system clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Recursively decodes all string fields in an object
   */
  decodeObject<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.decodeObject(item)) as any;
    }

    const newObj = { ...obj } as any;
    for (const key in newObj) {
      if (typeof newObj[key] === 'string') {
        newObj[key] = this.decode(newObj[key]);
      } else if (typeof newObj[key] === 'object') {
        newObj[key] = this.decodeObject(newObj[key]);
      }
    }
    return newObj;
  }
};

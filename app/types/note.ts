export type LevelOfDetail = "breve" | "medio" | "detallado" | "alto";

/**
 * Contenido de nota DECK - Solo metadata
 * NO incluye: content completo, userId
 */
export interface NoteContentDeck {
  id: number;
  tema?: string;
}

/**
 * Contenido de nota KLEK - Contenido completo para leer
 * NO incluye: userId (datos internos)
 */
export interface NoteContentKlek {
  id: number;
  tema?: string;
  title?: string;
  content: string;
  order?: number;
}

/**
 * Note DECK - Solo metadata para listar en grids
 * NO incluye: noteContents completo, userId, levelOfDetail, createdAt
 */
export interface NoteDeck {
  id: number;
  title: string;
  description: string;
  area?: string;
  tema?: string;
  acceso?: string;
  code?: string;
  contentsCount?: number;
  creatorName: string;
  likesCount: number;
  userLiked: boolean;
  canDelete?: boolean;
}

/**
 * Note KLEK - Contenido completo para leer
 * NO incluye: code, userId, levelOfDetail (datos internos)
 */
export interface NoteKlek {
  id: number;
  title: string;
  description?: string;
  area?: string;
  tema?: string;
  acceso?: string;
  noteContents: NoteContentKlek[];
  canDelete?: boolean;
}

/** Payload para POST /notes/generate/topic_or_reference - alineado con backend */
export interface GenerateNoteData {
  /** Texto de referencia (prioritario si viene) */
  reference?: string;
  topic?: string;
  referenceText?: string;
  numberOfNotes: number;
  levelOfDetail: "breve" | "medio" | "detallado";
  acceso?: string;
}

/** Respuesta del backend POST /notes/generate/topic_or_reference */
export interface GenerateNotesResponse {
  success: boolean;
  notes: NoteDeck[];
  message?: string;
  data?: NoteDeck[];
}

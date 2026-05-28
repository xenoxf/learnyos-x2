export interface FlashCardKlek {
  id: number;
  front: string;
  back: string;
  hint?: string;
}

/**
 * FlashCard DECK - Solo metadata para listar en grids
 * NO incluye: code, userId, createdAt
 */
export interface CardsDeck {
  id: number;
  title: string;
  description: string;
  code?: string;
  area?: string;
  tema?: string;
  totalCards?: number;
  flashcards?: FlashCardKlek[];
  creatorName: string;
  likesCount: number;
  userLiked: boolean;
  canDelete?: boolean;
}

/**
 * FlashCard KLEK - Datos completos para estudiar
 * NO incluye: code, userId, createdAt (datos internos)
 */
export interface CardKlek {
  id: number;
  title: string;
  area?: string;
  description?: string;
  tema?: string;
  flashcards: FlashCardKlek[];
}

export interface GenerateFlashCardData {
  reference: string;
  quantity: number;
  acceso?: string;
  file?: File;
}

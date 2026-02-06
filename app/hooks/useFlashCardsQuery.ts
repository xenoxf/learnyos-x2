'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  nextReviewDate: Date;
}

export const useGenerateFlashcards = () => {
  return useMutation({
    mutationFn: async ({
      topic,
      referenceText,
      numberOfCards,
    }: {
      topic?: string;
      referenceText?: string;
      numberOfCards?: number;
    }) =>
      Promise.all([
        topic ? Promise.resolve({ topic, quantity: numberOfCards }) : null,
        referenceText ? Promise.resolve({ reference: referenceText, quantity: numberOfCards }) : null,
      ]),
  });
};

export const useFlashcardsQuery = () => {
  const queryClient = useQueryClient();

  const createFlashcard = useMutation({
    mutationFn: (data: Partial<FlashCard>) =>
      Promise.resolve({
        id: Date.now(),
        question: (data as any).question || "",
        answer: (data as any).answer || "",
        difficulty: (data as any).difficulty || "medium",
        createdAt: new Date(),
        nextReviewDate: new Date(),
      } as FlashCard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });

  const deleteFlashcard = useMutation({
    mutationFn: (id: number) => Promise.resolve({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });

  return {
    createFlashcard,
    deleteFlashcard,
  };
};

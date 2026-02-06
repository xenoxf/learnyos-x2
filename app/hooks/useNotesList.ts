'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface Note {
  id: number;
  title: string;
  content: string;
  topic?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useGenerateNotes = () => {
  return useMutation({
    mutationFn: async ({
      topic,
      referenceText,
      numberOfNotes,
      levelOfDetail,
    }: {
      topic?: string;
      referenceText?: string;
      numberOfNotes?: number;
      levelOfDetail?: string;
    }) => {
      return Promise.all([
        topic
          ? Promise.resolve({ topic, quantity: numberOfNotes, level: levelOfDetail })
          : null,
        referenceText
          ? Promise.resolve({ reference: referenceText, quantity: numberOfNotes, level: levelOfDetail })
          : null,
      ]);
    },
  });
};

export const useNotesList = () => {
  const queryClient = useQueryClient();

  const createNote = useMutation({
    mutationFn: (data: Partial<Note>) =>
      Promise.resolve({
        id: Date.now(),
        title: (data as any).title || "",
        content: (data as any).content || "",
        topic: (data as any).topic,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id: number) => Promise.resolve({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    createNote,
    deleteNote,
  };
};

"use client";

import React from "react";
import NoteReaderFull from "@/components/notes/NoteReaderFull";

interface NoteReaderPageProps {
  params: {
    id: string;
  };
}

export default function NoteReaderPage({ params }: NoteReaderPageProps) {
  const noteId = parseInt(params.id, 10);

  if (isNaN(noteId)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Nota ID inválido</h1>
      </div>
    );
  }

  return <NoteReaderFull noteId={noteId} />;
}

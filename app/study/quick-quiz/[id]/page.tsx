"use client";

import React from "react";
import QuickQuizPlayer from "@/components/quiz/QuickQuizPlayer";

interface QuickQuizPlayerPageProps {
  params: { id: string };
}

export default function QuickQuizPlayerPage({ params }: QuickQuizPlayerPageProps) {
  const quizId = parseInt(params.id, 10);

  if (isNaN(quizId)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>ID de quiz inválido</h1>
      </div>
    );
  }

  return <QuickQuizPlayer quizId={quizId} />;
}

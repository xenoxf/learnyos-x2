"use client";

import React from "react";
import QuizPlayerFull from "@/components/quiz/QuizPlayerFull";

interface QuizPlayerPageProps {
  params: {
    id: string;
  };
}

export default function QuizPlayerPage({ params }: QuizPlayerPageProps) {
  const quizId = parseInt(params.id, 10);

  if (isNaN(quizId)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Quiz ID inválido</h1>
      </div>
    );
  }

  return <QuizPlayerFull quizId={quizId} />;
}

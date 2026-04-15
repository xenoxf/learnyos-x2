"use client";

import React from "react";
import QuizPlayerFull from "@/components/quiz/QuizPlayerFull";

interface ExamPlayerPageProps {
  params: {
    id: string;
  };
}

export default function ExamPlayerPage({ params }: ExamPlayerPageProps) {
  const examId = parseInt(params.id, 10);

  if (isNaN(examId)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Examen ID inválido</h1>
      </div>
    );
  }

  return <QuizPlayerFull quizId={examId} />;
}

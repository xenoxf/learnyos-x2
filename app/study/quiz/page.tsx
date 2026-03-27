"use client";

import React, { useState, useCallback } from "react";
import QuizGrid from "@/components/quiz/QuizGrid";
import QuizPlayer from "@/components/quiz/QuizPlayer";

export default function QuizPage() {
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const handleClosePlayer = useCallback(() => {
    setSelectedQuizId(null);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <QuizGrid onQuizOpen={setSelectedQuizId} />

      {selectedQuizId && (
        <QuizPlayer
          quizId={selectedQuizId}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}

"use client";

import React from "react";
import QuickQuizGrid from "@/components/quiz/QuickQuizGrid";

export default function QuickQuizPage() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <QuickQuizGrid /> {/* Quizzes rápidos tipo formulario */}
    </div>
  );
}

"use client";

import React from "react";
import QuizGrid from "@/components/quiz/QuizGrid";

export default function ExamsPage() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <QuizGrid /> {/* Exámenes estilo ICFES */}
    </div>
  );
}

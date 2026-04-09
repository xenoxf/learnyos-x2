"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EspacioPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/study/espacio/general");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <p style={{ color: "hsl(var(--muted-foreground))" }}>Redirigiendo...</p>
    </div>
  );
}

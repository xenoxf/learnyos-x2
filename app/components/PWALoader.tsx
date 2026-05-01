"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/pwaLoader.module.css";

export function PWALoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simular un tiempo mínimo de carga para que se aprecie el mensaje
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>LearnYos</h1>
        <p className={styles.quote}>"Solo pierdes cuando dejas de intentarlo"</p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      </div>
    </div>
  );
}

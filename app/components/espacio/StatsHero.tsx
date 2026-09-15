import React from "react";
import styles from "./StatsHero.module.css";
import { StatsHeroProps } from "@/types";


export const StatsHero: React.FC<StatsHeroProps> = ({
  totalAttempts,
  avgCorrect,
  bestScore,
  totalQuestions,
}) => {
  return (
    <>
      {bestScore && totalAttempts && totalQuestions && avgCorrect &&
        < section className={styles.hero} >
          <div className={styles.header}>
            <h2 className={styles.title}>Rendimiento</h2>
            <p className={styles.subtitle}>{totalAttempts} desafíos completados</p>
          </div>
          <div className={styles.grid}>
            <div className={styles.statBox}>
              <span className={styles.value}>{avgCorrect.toFixed(1)}</span>
              <span className={styles.label}>Promedio Aciertos</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.value}>{bestScore}</span>
              <span className={styles.label}>Máximo Puntaje</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.value}>{totalQuestions}</span>
              <span className={styles.label}>Preguntas Totales</span>
            </div>
          </div>
        </section >}
    </>
  );
};

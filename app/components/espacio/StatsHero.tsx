import React from "react";
import { TrendingUp, Award, CheckCircle } from "lucide-react";
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
            <div className={styles.iconWrapper}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className={styles.title}>Estadísticas de Aprendizaje</h2>
              <p className={styles.subtitle}>Has completado {totalAttempts} desafíos</p>
            </div>
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

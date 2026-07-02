import React from "react";
import { X, Award, Check, XCircle, Hash, BookOpen, User } from "lucide-react";
import styles from "./AttemptDetailModal.module.css";

import { Attempt } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface AttemptDetailModalProps {
  attempt: Attempt;
  onClose: () => void;
}

export const AttemptDetailModal: React.FC<AttemptDetailModalProps> = ({
  attempt,
  onClose,
}) => {
  const percentage = attempt.totalQuestions > 0
    ? Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)
    : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <Award size={20} className={styles.icon} />
            <h3>Análisis de Desempeño</h3>
          </div>
          <button className={styles.close} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.grid}>
            {/* Score Summary */}
            <div className={styles.scoreSection}>
              <h2 className={styles.examTitle}>{attempt.examTitle}</h2>

              <div className={styles.scoreCard}>
                <div className={styles.circularScore}>
                  <span className={styles.scoreValue}>{percentage}%</span>
                  <span className={styles.scoreLabel}>Logrado</span>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.miniStat}>
                    <div className={`${styles.miniIcon} ${styles.success}`}>
                      <Check size={14} />
                    </div>
                    <div>
                      <div className={styles.miniVal}>{attempt.correctAnswers}</div>
                      <div className={styles.miniLab}>Correctas</div>
                    </div>
                  </div>
                  <div className={styles.miniStat}>
                    <div className={`${styles.miniIcon} ${styles.error}`}>
                      <XCircle size={14} />
                    </div>
                    <div>
                      <div className={styles.miniVal}>{attempt.totalQuestions - attempt.correctAnswers}</div>
                      <div className={styles.miniLab}>Erróneas</div>
                    </div>
                  </div>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metadata Details */}
            <div className={styles.detailsSection}>
              <div className={styles.detailGroup}>
                <h4 className={styles.groupTitle}>
                  <Hash size={14} /> Identificación
                </h4>
                <div className={styles.detailItem}>
                  <span>Código</span>
                  <span className={styles.codePill}>{attempt.examCode || "N/A"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Tu eres</span>
                  <span className={styles.codePill}>{useAuth().user?.name || "N/A"}</span>
                </div>

              </div>

              <div className={styles.detailGroup}>
                <h4 className={styles.groupTitle}>
                  <BookOpen size={14} /> Academia
                </h4>
                <div className={styles.detailItem}>
                  <span>Área</span>
                  <span>{attempt.examArea || "General"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Tema</span>
                  <span>{attempt.examTema || "Varios"}</span>
                </div>
              </div>

              <div className={styles.detailGroup}>
                <h4 className={styles.groupTitle}>
                  <User size={14} /> Autoría
                </h4>
                <div className={styles.detailItem}>
                  <span>Creado por</span>
                  <span>{attempt.examCreatorName || "LearnyOS"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Fecha</span>
                  <span>
                    {new Date(attempt.attemptedAt).toLocaleDateString("es-ES", {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

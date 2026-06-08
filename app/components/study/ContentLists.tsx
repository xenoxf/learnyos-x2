"use client";

import React from "react";
import { BookOpen, Layers, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "@/styles/klerk.module.css";
import type { ExamDeck, CardsDeck } from "@/types";

interface ContentListsProps {
  exams: ExamDeck[];
  cards: CardsDeck[];
  isLoading: boolean;
  onSelectCard: (id: number) => void;
}

export function ContentLists({ exams, cards, isLoading, onSelectCard }: ContentListsProps) {
  const router = useRouter();

  return (
    <div className={styles.twoColLayout}>
      <div className={styles.col}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><BookOpen size={20} /> Exámenes</h2>
          <button className={styles.seeMoreBtn} onClick={() => router.push("/study/quiz")}>Ver todos</button>
        </div>
        <div className={styles.verticalList}>
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className={styles.skeletonCard} style={{ height: '72px' }} />)
          ) : exams.length > 0 ? (
            exams.slice(0, 4).map((exam) => (
              <div key={exam.id} className={styles.listItem} onClick={() => router.push(`/study/quiz/${exam.id}`)}>
                <div className={styles.listItemIcon} style={{ backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                  <FileText size={18} />
                </div>
                <div className={styles.listItemInfo}>
                  <h4 className={styles.listItemTitle}>{exam.title}</h4>
                  <span className={styles.listItemMeta}>{exam.totalQuestions || 0} preguntas · {exam.likesCount || 0} likes</span>
                </div>
                {exam.difficulty && <span className={styles.listItemBadge}>{exam.difficulty}</span>}
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Sin exámenes públicos aún</p>
          )}
        </div>
      </div>

      <div className={styles.col}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><Layers size={20} /> Flashcards</h2>
          <button className={styles.seeMoreBtn} onClick={() => router.push("/study/flashcards")}>Ver todas</button>
        </div>
        <div className={styles.verticalList}>
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className={styles.skeletonCard} style={{ height: '72px' }} />)
          ) : cards.length > 0 ? (
            cards.slice(0, 4).map((card) => (
              <div key={card.id} className={styles.listItem} onClick={() => onSelectCard(card.id)}>
                <div className={styles.listItemIcon} style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  <Layers size={18} />
                </div>
                <div className={styles.listItemInfo}>
                  <h4 className={styles.listItemTitle}>{card.title}</h4>
                  <span className={styles.listItemMeta}>{card.totalCards || 0} tarjetas · {card.likesCount || 0} likes</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Sin mazos públicos aún</p>
          )}
        </div>
      </div>
    </div>
  );
}

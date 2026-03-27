import React, { useEffect, useState, useCallback } from "react";
import QuizCard from "./QuizCard";
import CreateQuizModal from "./CreateQuizModal";
import styles from "@/styles/quiz/quizGrid.module.css";
import type { Exam } from "@/types";
import { Input } from "../ui/input";
import { apiService } from "@/services/apiService";
import { Filter, Pyramid, Plus, Globe, Lock } from "lucide-react";
import { Button } from "../ui/button";

interface QuizGridProps {
  onQuizOpen?: (quizId: number) => void;
}

export default function QuizGrid({ onQuizOpen }: QuizGridProps) {
  const [searchValue, setSearchValue] = useState("");
  const [quizzes, setQuizzes] = useState<(Exam & { canDelete?: boolean })[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<(Exam & { canDelete?: boolean })[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"private" | "public">("private");

  const filterQuizzes = useCallback(
    (quizzesToFilter: (Exam & { canDelete?: boolean })[], term: string) => {
      const filtered = quizzesToFilter.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(term.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(term.toLowerCase())
      );
      setQuizzes(filtered);
    },
    []
  );

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const currentUserId = apiService.getUser()?.id;
      const data =
        viewMode === "private"
          ? await apiService.getExamsPrivate()
          : await apiService.getExamsPublic();
      const mapped = (data as (Exam & { canDelete?: boolean })[]).map((quiz) => ({
        ...quiz,
        canDelete: Boolean(currentUserId && quiz.userId && currentUserId === quiz.userId),
      }));
      setAllQuizzes(mapped);
      filterQuizzes(mapped, searchValue);
    } catch (err) {
      console.error("Error loading quizzes:", err);
      setAllQuizzes([]);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [searchValue, filterQuizzes, viewMode]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  useEffect(() => {
    filterQuizzes(allQuizzes, searchValue);
  }, [searchValue, allQuizzes, filterQuizzes]);

  const handleQuizCreated = async () => {
    await loadQuizzes();
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.viewTabs}>
            <button
              type="button"
              className={`${styles.viewTab} ${viewMode === "private" ? styles.viewTabActive : ""}`}
              onClick={() => setViewMode("private")}
            >
              <Lock size={16} /> Privados
            </button>
            <button
              type="button"
              className={`${styles.viewTab} ${viewMode === "public" ? styles.viewTabActive : ""}`}
              onClick={() => setViewMode("public")}
            >
              <Globe size={16} /> Publicos
            </button>
          </div>
          <div className={styles.searchSection}>
            <Input
              className={styles.searchInput}
              placeholder="Busca un quiz..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className={styles.filterBtn} title="Filtrar">
              <Filter size={20} />
            </button>
            <button className={styles.sortBtn} title="Ordenar">
              <Pyramid size={20} />
            </button>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className={styles.createBtn}
          >
            <Plus size={20} />
            Crear Quiz
          </Button>
        </div>

        <div className={styles.gridContainer}>
          {loading ? (
            <div className={styles.loadingState}>
              <p>Cargando quizzes...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {allQuizzes.length === 0
                  ? viewMode === "private"
                    ? "No hay quizzes privados disponibles. Crea uno para empezar."
                    : "No hay quizzes publicos disponibles."
                  : "No se encontraron quizzes con esa búsqueda"}
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onQuizDeleted={handleQuizCreated}
                  onQuizOpen={onQuizOpen}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateQuizModal
          onClose={() => setShowCreate(false)}
          onQuizCreated={handleQuizCreated}
        />
      )}
    </>
  );
}
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader, Minus, Plus } from "lucide-react";
import styles from "@/styles/notes/NoteGenerator.module.css";

export type LevelOfDetail = "breve" | "medio" | "detallado";

interface NoteGeneratorProps {
  onGenerate: (
    topic: string,
    numberOfNotes: number,
    levelOfDetail: LevelOfDetail,
  ) => Promise<void>;
  isGenerating: boolean;
}

const LEVEL_DETAILS: Record<LevelOfDetail, string> = {
  breve: "Resumen corto y conciso",
  medio: "Contenido moderado con detalles",
  detallado: "Información completa y profunda",
};

export function NoteGenerator({
  onGenerate,
  isGenerating,
}: NoteGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [numberOfNotes, setNumberOfNotes] = useState(1);
  const [levelOfDetail, setLevelOfDetail] = useState<LevelOfDetail>("medio");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    await onGenerate(topic.trim(), numberOfNotes, levelOfDetail);
    setTopic("");
    setNumberOfNotes(1);
  };

  const increment = () => setNumberOfNotes((prev) => Math.min(5, prev + 1));
  const decrement = () => setNumberOfNotes((prev) => Math.max(1, prev - 1));

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <Sparkles className={styles.icon} size={24} />
        <div>
          <h2 className={styles.title}>Generar Nueva Nota</h2>
          <p className={styles.subtitle}>
            Ingresa un tema y deja que la IA cree notas de estudio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="topic" className={styles.label}>
            Tema
          </label>
          <Input
            id="topic"
            type="text"
            placeholder="Ej: La Revolución Francesa, Teorema de Pitágoras..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
            className={styles.input}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="quantity" className={styles.label}>
              Cantidad
            </label>
            <div className={styles.quantityControl}>
              <Button
                type="button"
                variant="outline"
                onClick={decrement}
                disabled={isGenerating || numberOfNotes <= 1}
                className={styles.quantityButton}
                aria-label="Disminuir cantidad"
              >
                <Minus size={16} />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="5"
                value={numberOfNotes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= 5) {
                    setNumberOfNotes(val);
                  }
                }}
                disabled={isGenerating}
                className={styles.quantityInput}
              />
              <Button
                type="button"
                variant="outline"
                onClick={increment}
                disabled={isGenerating || numberOfNotes >= 5}
                className={styles.quantityButton}
                aria-label="Aumentar cantidad"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nivel de Detalle</label>
            <div className={styles.levelButtons}>
              {(["breve", "medio", "detallado"] as const).map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={levelOfDetail === level ? "default" : "outline"}
                  onClick={() => setLevelOfDetail(level)}
                  disabled={isGenerating}
                  className={styles.levelButton}
                  title={LEVEL_DETAILS[level]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
            <p className={styles.levelHint}>{LEVEL_DETAILS[levelOfDetail]}</p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className={styles.generateButton}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader className={styles.spinner} size={18} />
              <span>Generando...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generar Nota{numberOfNotes > 1 ? "s" : ""}</span>
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { X, Plus, Trash2, Save, Layers } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { cardsService } from "@/services/cardsService";
import { MiniEditor } from "@/components/MiniEditor";
import styles from "@/styles/flashCards/createManualFlashcardModal.module.css";

interface FlashcardItem {
  front: string;
  back: string;
  hint: string;
}

interface CreateCardPayload {
  title: string;
  description?: string;
  area?: string;
  tema?: string;
  acceso?: string;
}

export function CreateManualFlashcardModal({
  onClose,
  onCardCreated,
}: {
  onClose: () => void;
  onCardCreated?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [tema, setTema] = useState("");
  const [acceso, setAcceso] = useState("public");
  const [cards, setCards] = useState<FlashcardItem[]>([
    { front: "", back: "", hint: "" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const addCard = useCallback(() => {
    setCards(prev => [...prev, { front: "", back: "", hint: "" }]);
  }, []);

  const removeCard = useCallback((i: number) => {
    setCards(prev => prev.filter((_, j) => j !== i));
  }, []);

  const updateCard = useCallback(
    (i: number, field: keyof FlashcardItem, value: string) => {
      setCards(prev =>
        prev.map((c, j) => (j === i ? { ...c, [field]: value } : c)),
      );
    },
    [],
  );

  const validate = useCallback(() => {
    if (!title.trim()) {
      toast.error("Validación", "El título es obligatorio");
      return false;
    }
    if (cards.length === 0) {
      toast.error("Validación", "Agrega al menos una flashcard");
      return false;
    }
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].front.trim()) {
        toast.error("Validación", `Flashcard ${i + 1}: el frente está vacío`);
        return false;
      }
      if (!cards[i].back.trim()) {
        toast.error("Validación", `Flashcard ${i + 1}: el reverso está vacío`);
        return false;
      }
    }
    return true;
  }, [title, cards]);

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: CreateCardPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        area: area.trim() || undefined,
        tema: tema.trim() || undefined,
        acceso,
      };
      const { id: deckId } = await cardsService.createCard(payload);

      if (cards.some(c => c.front.trim())) {
        await cardsService.addFlashcardsToDeck(
          deckId,
          cards.map(c => ({
            front: c.front.trim(),
            back: c.back.trim(),
            hint: c.hint.trim() || undefined,
          })),
        );
      }

      toast.success("Guardado", "Deck de flashcards creado exitosamente");
      onCardCreated?.();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo guardar el deck";
      toast.error("Error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-flashcard-title"
    >
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.headerIcon}>
              <Layers size={16} />
            </div>
            <h2 className={styles.title} id="manual-flashcard-title">
              Crear Flashcards Manual
            </h2>
          </div>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            type="button"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.body}>
          <div className={styles.grid2}>
            <div className={styles.fieldGroup}>
              <label htmlFor="title-input" className={styles.fieldLabel}>
                Título *
              </label>
              <input
                id="title-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={styles.input}
                placeholder="Ej: Verbos irregulares en inglés"
                required
                autoFocus
              />
            </div>
            <div className={styles.flexRow}>
              <div className={styles.fieldGroup}>
                <label htmlFor="area-input" className={styles.fieldLabel}>
                  Área
                </label>
                <input
                  id="area-input"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className={styles.input}
                  placeholder="Ej: Inglés"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="tema-input" className={styles.fieldLabel}>
                  Tema
                </label>
                <input
                  id="tema-input"
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  className={styles.input}
                  placeholder="Ej: Verbos"
                />
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="acceso-select" className={styles.fieldLabel}>
                Visibilidad
              </label>
              <select
                id="acceso-select"
                value={acceso}
                onChange={e => setAcceso(e.target.value)}
                className={styles.input}
              >
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
            </div>
          </div>

          <MiniEditor
            value={description}
            onChange={setDescription}
            placeholder="Descripción opcional del deck"
            minRows={2}
            label="Descripción"
          />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                Flashcards ({cards.length})
              </h3>
              <button
                onClick={addCard}
                className={styles.addBtn}
                type="button"
              >
                <Plus size={14} /> Agregar flashcard
              </button>
            </div>

            {cards.map((c, i) => (
              <div key={i} className={styles.cardCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.cardLabel}>
                    Flashcard {i + 1}
                  </span>
                  {cards.length > 1 && (
                    <button
                      onClick={() => removeCard(i)}
                      className={styles.deleteBtn}
                      type="button"
                      aria-label={`Eliminar flashcard ${i + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className={styles.cardGrid}>
                  <MiniEditor
                    value={c.front}
                    onChange={v => updateCard(i, "front", v)}
                    placeholder="Frente (término / pregunta)"
                    minRows={2}
                  />
                  <MiniEditor
                    value={c.back}
                    onChange={v => updateCard(i, "back", v)}
                    placeholder="Reverso (definición / respuesta)"
                    minRows={2}
                  />
                </div>
                <input
                  value={c.hint}
                  onChange={e => updateCard(i, "hint", e.target.value)}
                  className={styles.hintInput}
                  placeholder="Pista (opcional)"
                  aria-label={`Pista para flashcard ${i + 1}`}
                />
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button
              onClick={onClose}
              className={styles.cancelBtn}
              type="button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={styles.saveBtn}
            >
              <Save size={16} />
              {saving ? "Guardando..." : "Guardar Deck"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

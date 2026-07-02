"use client";

import React, { useState, useCallback } from "react";
import { X, Plus, Trash2, Save, Layers } from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { cardsService } from "@/services/cardsService";

interface FlashcardItem {
  front: string;
  back: string;
  hint: string;
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

  const addCard = useCallback(() => {
    setCards(prev => [...prev, { front: "", back: "", hint: "" }]);
  }, []);

  const removeCard = useCallback((i: number) => {
    setCards(prev => prev.filter((_, j) => j !== i));
  }, []);

  const updateCard = useCallback((i: number, field: keyof FlashcardItem, value: string) => {
    setCards(prev => prev.map((c, j) => j === i ? { ...c, [field]: value } : c));
  }, []);

  const validate = useCallback(() => {
    if (!title.trim()) { toast.error("Validación", "El título es obligatorio"); return false; }
    if (cards.length === 0) { toast.error("Validación", "Agrega al menos una flashcard"); return false; }
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].front.trim()) { toast.error("Validación", `Flashcard ${i + 1}: el frente está vacío`); return false; }
      if (!cards[i].back.trim()) { toast.error("Validación", `Flashcard ${i + 1}: el reverso está vacío`); return false; }
    }
    return true;
  }, [title, cards]);

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { id: deckId } = await cardsService.createCard({
        title: title.trim(),
        description: description.trim() || undefined,
        area: area.trim() || undefined,
        tema: tema.trim() || undefined,
        acceso,
      } as any);

      if (cards.some(c => c.front.trim())) {
        await cardsService.addFlashcardsToDeck(deckId, cards.map(c => ({
          front: c.front.trim(),
          back: c.back.trim(),
          hint: c.hint.trim() || undefined,
        })));
      }

      toast.success("Guardado", "Deck de flashcards creado exitosamente");
      onCardCreated?.();
      onClose();
    } catch (err: any) {
      toast.error("Error", err.message || "No se pudo guardar el deck");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Layers size={16} />
            </div>
            <h2 className="text-lg font-bold">Crear Flashcards Manual</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" type="button">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="Ej: Verbos irregulares en inglés" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Área</label>
                <input value={area} onChange={e => setArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  placeholder="Ej: Inglés" />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Tema</label>
                <input value={tema} onChange={e => setTema(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  placeholder="Ej: Verbos" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Visibilidad</label>
              <select value={acceso} onChange={e => setAcceso(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
              placeholder="Descripción opcional del deck" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Flashcards ({cards.length})</h3>
              <button onClick={addCard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                type="button">
                <Plus size={14} /> Agregar flashcard
              </button>
            </div>

            {cards.map((c, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Flashcard {i + 1}</span>
                  {cards.length > 1 && (
                    <button onClick={() => removeCard(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors" type="button">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <textarea value={c.front} onChange={e => updateCard(i, "front", e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                    placeholder="Frente (término / pregunta)" />
                  <textarea value={c.back} onChange={e => updateCard(i, "back", e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                    placeholder="Reverso (definición / respuesta)" />
                </div>
                <input value={c.hint} onChange={e => updateCard(i, "hint", e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  placeholder="Pista (opcional)" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors" type="button">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            type="button">
            <Save size={16} />
            {saving ? "Guardando..." : "Guardar Deck"}
          </button>
        </div>
      </div>
    </div>
  );
}

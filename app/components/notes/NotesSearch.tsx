"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import styles from "@/styles/notes/NotesSearch.module.css";

interface NotesSearchProps {
  value: string;
  onChange: (value: string) => void;
  totalNotes: number;
  filteredCount: number;
}

export function NotesSearch({
  value,
  onChange,
  totalNotes,
  filteredCount,
}: NotesSearchProps) {
  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={18} />
        <Input
          type="text"
          placeholder="Buscar en tus notas por título o contenido..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.searchInput}
          aria-label="Buscar notas"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            className={styles.clearButton}
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {totalNotes > 0 && (
        <p className={styles.stats}>
          Mostrando <span className={styles.statsNumber}>{filteredCount}</span>{" "}
          de <span className={styles.statsNumber}>{totalNotes}</span> notas
        </p>
      )}
    </div>
  );
}

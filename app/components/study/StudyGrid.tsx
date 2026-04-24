/**
 * Componentes reutilizables para grids de estudio (notes, cards, quiz)
 * Centraliza la lógica común para evitar repetición de código
 */

"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "@/styles/components/studyGrid.module.css";
import { authService } from "@/services/authService";

export type ViewMode = "private" | "public";

export interface StudyGridBaseItem {
  id: number;
  title: string;
  description?: string | null;
  userId?: number | null;
  createdAt?: string;
}

export interface StudyGridActions<T extends StudyGridBaseItem> {
  onLoad: (viewMode: ViewMode) => Promise<T[]>;
  onItemOpen?: (item: T) => void;
  onItemDeleted?: () => Promise<void>;
  onCreateClick?: () => void;
}

export interface StudyGridConfig {
  entitySingular: string;
  entityPlural: string;
  searchPlaceholder: string;
  createButtonText: string;
  privateTabText: string;
  publicTabText: string;
  emptyPrivateText: string;
  emptyPublicText: string;
  emptySearchText: string;
  loadingText: string;
}

export interface StudyGridProps<T extends StudyGridBaseItem> {
  actions: StudyGridActions<T>;
  config: StudyGridConfig;
  defaultViewMode?: ViewMode;
  renderCard: (item: T & { canDelete?: boolean }) => React.ReactNode;
  createModal?: React.ReactNode;
}

export function useStudyGrid<
  T extends StudyGridBaseItem & { code?: string | null },
>({
  actions,
  config,
  defaultViewMode = "public",
}: {
  actions: StudyGridActions<T>;
  config: StudyGridConfig;
  defaultViewMode?: ViewMode;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems] = useState<(T & { canDelete?: boolean })[]>([]);
  const [allItems, setAllItems] = useState<(T & { canDelete?: boolean })[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [showCreate, setShowCreate] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuest(authService.isGuest());
    }
  }, []);

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user).id : null;
    } catch {
      return null;
    }
  }, []);

  const filterItems = useCallback(
    (itemsToFilter: (T & { canDelete?: boolean })[], term: string) => {
      const trimmed = term.trim().toLowerCase();
      if (!trimmed) {
        setItems(itemsToFilter);
        return;
      }

      const filtered = itemsToFilter.filter((item) => {
        const anyItem = item as any;
        return (
          anyItem.title?.toLowerCase().includes(trimmed) ||
          anyItem.description?.toLowerCase().includes(trimmed) ||
          anyItem.area?.toLowerCase().includes(trimmed) ||
          anyItem.tema?.toLowerCase().includes(trimmed)
        );
      });
      setItems(filtered);
    },
    [],
  );

  const loadItems = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      const data = await actions.onLoad(viewMode);
      const typedData = data.map((item) => ({
        ...item,
        canDelete: Boolean(
          currentUserId && item.userId && currentUserId === item.userId,
        ),
      }));
      setAllItems(typedData);

      if (searchValue.trim()) {
        filterItems(typedData, searchValue);
      } else {
        setItems(typedData);
      }
    } catch {
      setAllItems([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [
    actions,
    currentUserId,
    searchValue,
    viewMode,
    filterItems,
    loading,
  ]);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  useEffect(() => {
    if (searchValue.trim().length === 0) {
      setItems(allItems);
    } else {
      filterItems(allItems, searchValue);
    }
  }, [searchValue, allItems, filterItems]);

  const handleCreateClick = useCallback(() => {
    if (isGuest) {
      alert("Inicia sesión para crear contenido");
      return;
    }
    if (actions.onCreateClick) {
      actions.onCreateClick();
    } else {
      setShowCreate(true);
    }
  }, [actions, isGuest]);

  const handleCloseModal = useCallback(() => {
    setShowCreate(false);
  }, []);

  const handleItemDeleted = useCallback(async () => {
    if (actions.onItemDeleted) {
      await actions.onItemDeleted();
    } else {
      await loadItems();
    }
  }, [actions, loadItems]);

  const resultText = useMemo(() => {
    if (allItems.length === 0) {
      return viewMode === "private"
        ? config.emptyPrivateText
        : config.emptyPublicText;
    }
    return items.length === 0 ? config.emptySearchText : "";
  }, [allItems.length, items.length, viewMode, config]);

  return {
    searchValue,
    setSearchValue,
    items,
    allItems,
    loading,
    viewMode,
    setViewMode,
    showCreate,
    setShowCreate,
    resultText,
    handleCreateClick,
    handleCloseModal,
    handleItemDeleted,
    loadItems,
    isGuest,
  };
}

export function StudyGridHeader({
  config,
  viewMode,
  setViewMode,
  searchValue,
  setSearchValue,
  onCreateClick,
  isGuest,
}: {
  config: StudyGridConfig;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  onCreateClick: () => void;
  isGuest?: boolean;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.searchSection}>
          <Input
            className={styles.searchInput}
            placeholder={config.searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Buscar"
          />
        </div>
        <div className={styles.createBtnWrapper}>
          <Button
            onClick={onCreateClick}
            className={styles.createBtn}
            type="button"
            disabled={isGuest}
            style={
              isGuest ? { opacity: 0.5, pointerEvents: "none" } : undefined
            }
          >
            <Plus size={20} />
            {config.createButtonText}
          </Button>
        </div>
      </div>

      <div className={styles.viewTabs}>
        <button
          type="button"
          className={`${styles.viewTab} ${viewMode === "private" ? styles.viewTabActive : ""}`}
          onClick={() => setViewMode("private")}
        >
          <Lock size={16} /> {config.privateTabText}
        </button>
        <button
          type="button"
          className={`${styles.viewTab} ${viewMode === "public" ? styles.viewTabActive : ""}`}
          onClick={() => setViewMode("public")}
        >
          <Globe size={16} /> {config.publicTabText}
        </button>
      </div>
    </header>
  );
}

export function StudyGridContent<T extends StudyGridBaseItem>({
  loading,
  items,
  allItems,
  resultText,
  config,
  renderCard,
}: {
  loading: boolean;
  items: (T & { canDelete?: boolean })[];
  allItems: (T & { canDelete?: boolean })[];
  resultText: string;
  config: StudyGridConfig;
  renderCard: (item: T & { canDelete?: boolean }) => React.ReactNode;
}) {
  return (
    <div className={styles.gridContainer}>
      {loading ? (
        <div className={styles.loadingState}>
          <p>{config.loadingText}</p>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{resultText}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => renderCard(item))}
        </div>
      )}
    </div>
  );
}

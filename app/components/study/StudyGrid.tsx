/**
 * Componentes reutilizables para grids de estudio (notes, cards, quiz)
 * Centraliza la lógica común para evitar repetición de código
 */

"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Plus, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "@/styles/components/studyGrid.module.css";

export type ViewMode = "private" | "public";

export interface StudyGridBaseItem {
  id: number;
  title: string;
  description?: string | null;
  userId?: number | null;
  createdAt?: string;
}

export interface StudyGridActions<T extends StudyGridBaseItem> {
  onLoad: () => Promise<T[]>;
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

export function useStudyGrid<T extends StudyGridBaseItem>({
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
  const viewModeRef = useRef(viewMode);

  // Keep ref updated
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

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
      const filtered = itemsToFilter.filter(
        (item) =>
          item.title.toLowerCase().includes(term.toLowerCase()) ||
          item.description?.toLowerCase().includes(term.toLowerCase()),
      );
      setItems(filtered);
    },
    [],
  );

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await actions.onLoad();
      const typedData = data.map((item) => ({
        ...item,
        canDelete: Boolean(
          currentUserId && item.userId && currentUserId === item.userId,
        ),
      }));
      setAllItems(typedData);
      filterItems(typedData, searchValue);
    } catch (err) {
      console.error(`Error loading ${config.entityPlural}:`, err);
      setAllItems([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [actions.onLoad, currentUserId, searchValue, filterItems, config.entityPlural]);

  // Load items on mount and when viewMode changes
  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Filter when search changes
  useEffect(() => {
    filterItems(allItems, searchValue);
  }, [searchValue, allItems, filterItems]);

  const handleCreateClick = useCallback(() => {
    if (actions.onCreateClick) {
      actions.onCreateClick();
    } else {
      setShowCreate(true);
    }
  }, [actions.onCreateClick]);

  const handleCloseModal = useCallback(() => {
    setShowCreate(false);
  }, []);

  const handleItemDeleted = useCallback(async () => {
    if (actions.onItemDeleted) {
      await actions.onItemDeleted();
    } else {
      await loadItems();
    }
  }, [actions.onItemDeleted, loadItems]);

  const resultText = useMemo(() => {
    if (allItems.length === 0) {
      return viewMode === "private"
        ? config.emptyPrivateText
        : config.emptyPublicText;
    }
    return config.emptySearchText;
  }, [allItems.length, viewMode, config]);

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
  };
}

export function StudyGridHeader({
  config,
  viewMode,
  setViewMode,
  searchValue,
  setSearchValue,
  onCreateClick,
}: {
  config: StudyGridConfig;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  onCreateClick: () => void;
}) {
  return (
    <div className={styles.header}>
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
      <div className={styles.searchSection}>
        <Input
          className={styles.searchInput}
          placeholder={config.searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          aria-label="Buscar"
        />
      </div>
      <Button onClick={onCreateClick} className={styles.createBtn} type="button">
        <Plus size={20} />
        {config.createButtonText}
      </Button>
    </div>
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
        <div className={styles.grid}>{items.map((item) => renderCard(item))}</div>
      )}
    </div>
  );
}

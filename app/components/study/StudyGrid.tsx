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

export function useStudyGrid<T extends StudyGridBaseItem & { code?: string | null }>({
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
  const [codeSearchResult, setCodeSearchResult] = useState<T | null>(null);
  const [isCodeSearch, setIsCodeSearch] = useState(false);
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
      // Si el término parece un código (5 caracteres alfanuméricos), buscar por código
      const isCodePattern = /^[A-Z0-9]{5}$/i.test(term.trim());
      
      if (isCodePattern && term.trim().length === 5) {
        // Búsqueda por código - se hace en backend
        setIsCodeSearch(true);
        return; // Se maneja en loadCodeSearch
      }
      
      // Búsqueda normal por texto - frontend filter
      setIsCodeSearch(false);
      setCodeSearchResult(null);
      const filtered = itemsToFilter.filter(
        (item) =>
          item.title.toLowerCase().includes(term.toLowerCase()) ||
          item.description?.toLowerCase().includes(term.toLowerCase()),
      );
      setItems(filtered);
    },
    [],
  );

  const loadCodeSearch = useCallback(async (code: string) => {
    try {
      setLoading(true);
      // Aquí se haría la petición al backend para buscar por código
      // Por ahora, filtramos en frontend por el code
      const found = allItems.find(
        (item) => item.code?.toUpperCase() === code.toUpperCase()
      );
      if (found) {
        setCodeSearchResult(found);
        setItems([found]);
      } else {
        setCodeSearchResult(null);
        setItems([]);
      }
    } catch (err) {
      console.error("Error searching by code:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [allItems]);

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
      
      // Si hay búsqueda por código activa, mantenerla
      if (isCodeSearch && searchValue) {
        loadCodeSearch(searchValue);
      } else {
        // Filtrado normal por texto
        const filtered = typedData.filter(
          (item) =>
            searchValue === "" ||
            item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        setItems(filtered);
      }
    } catch (err) {
      console.error(`Error loading ${config.entityPlural}:`, err);
      setAllItems([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [actions.onLoad, currentUserId, searchValue, isCodeSearch, loadCodeSearch, config.entityPlural]);

  // Load items on mount and when viewMode changes
  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Handle search input changes
  useEffect(() => {
    if (searchValue.trim().length === 0) {
      // Resetear a todos los items si búsqueda vacía
      setIsCodeSearch(false);
      setCodeSearchResult(null);
      setItems(allItems);
    } else if (!isCodeSearch) {
      // Filtrado por texto en frontend
      filterItems(allItems, searchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

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
    if (isCodeSearch && searchValue) {
      return codeSearchResult
        ? `Código "${searchValue}" encontrado`
        : `No se encontró ningún ${config.entitySingular} con el código "${searchValue}"`;
    }
    if (allItems.length === 0) {
      return viewMode === "private"
        ? config.emptyPrivateText
        : config.emptyPublicText;
    }
    return items.length === 0 ? config.emptySearchText : "";
  }, [allItems.length, items.length, viewMode, config, isCodeSearch, searchValue, codeSearchResult]);

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
    isCodeSearch,
    codeSearchResult,
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

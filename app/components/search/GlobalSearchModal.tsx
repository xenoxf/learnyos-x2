"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { searchService } from "@/services/searchService";

export function GlobalSearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const debouncedSearch = useCallback(
    async (q: string) => {
      if (!q || q.trim().length < 2) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const data = await searchService.globalSearch(q.trim(), 6);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
      const timer = setTimeout(() => debouncedSearch(query), 300);
      return () => clearTimeout(timer);
    }, [query, debouncedSearch]);

  if (!isOpen) return null;

  const itemTypes = [
    { key: "exams", label: "Exámenes", icon: "📝", path: "/study/quiz" },
    { key: "notes", label: "Notas", icon: "📄", path: "/study/notes" },
    { key: "flashcards", label: "Flashcards", icon: "🃏", path: "/study/flashcards" },
    { key: "chats", label: "Chats", icon: "💬", path: "/study/chat" },
  ];

  const totalItems = itemTypes.reduce((acc, t) => acc + (results?.[t.key]?.length || 0), 0);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", paddingTop: "15vh",
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          width: "100%", maxWidth: "600px",
          maxHeight: "70vh", overflow: "auto",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", gap: "0.75rem" }}>
          <Search size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar exámenes, notas, flashcards, chats..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, border: "none", background: "transparent",
              outline: "none", fontSize: "1rem", color: "var(--foreground)",
            }}
          />
          {loading && <Loader2 size={18} className="animate-spin" />}
          <kbd style={{ fontSize: "0.7rem", opacity: 0.5, border: "1px solid var(--border)", borderRadius: "0.25rem", padding: "0.1rem 0.4rem" }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ padding: "0.75rem" }}>
          {query.trim().length < 2 && !loading && (
            <p style={{ textAlign: "center", opacity: 0.5, padding: "2rem 0", fontSize: "0.9rem" }}>
              Escribe al menos 2 caracteres para buscar
            </p>
          )}
          {totalItems === 0 && !loading && query.trim().length >= 2 && (
            <p style={{ textAlign: "center", opacity: 0.5, padding: "2rem 0", fontSize: "0.9rem" }}>
              Sin resultados para &ldquo;{query}&rdquo;
            </p>
          )}
          {itemTypes.map((t) => {
            const items = results?.[t.key] || [];
            if (items.length === 0) return null;
            return (
              <div key={t.key} style={{ marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.75rem", opacity: 0.5, padding: "0 0.5rem", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                  {t.icon} {t.label}
                </p>
                {items.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(`${t.path}${t.key === 'chats' ? `?chat=${item.id}` : `/${item.id}`}`);
                      setIsOpen(false);
                    }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "0.6rem 0.75rem", border: "none", background: "transparent",
                      cursor: "pointer", borderRadius: "0.5rem", color: "var(--foreground)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.title}</p>
                    <p style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                      {item.description || item.topic || item.subject || ""}
                    </p>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

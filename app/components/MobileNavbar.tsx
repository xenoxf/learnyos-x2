"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  CreditCard,
  NotebookPen,
  Languages,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/mobileNavbar.module.css";
import Link from "next/link";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

/**
 * Priority order: highest (index 0) → lowest (last index).
 * Items are hidden from the END first (Traductor first, then Flashcards, etc.)
 */
const ALL_NAV_ITEMS: MenuItem[] = [
  { title: "Inicio", url: "/study", icon: LayoutDashboard },
  { title: "Chat", url: "/study/chat", icon: MessageSquare, badge: 3 },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
  { title: "Traductor", url: "/study/translator", icon: Languages },
];

export function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [visibleCount, setVisibleCount] = useState(ALL_NAV_ITEMS.length);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // ─── Refs ────────────────────────────────────────────────────────────────────

  // The visible nav pill — observed for size changes
  const navRef = useRef<HTMLElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * GHOST container: always rendered off-screen with ALL items at full size.
   * This is the source of truth for item widths — it is never affected by
   * visibleCount, so measurements are always accurate in both directions
   * (shrinking AND growing).
   */
  const ghostRef = useRef<HTMLDivElement>(null);
  const ghostItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ghostMoreRef = useRef<HTMLDivElement>(null);

  // ─── Measurement ─────────────────────────────────────────────────────────────

  const computeVisibleCount = useCallback(() => {
    const nav = navRef.current;
    const ghost = ghostRef.current;
    if (!nav || !ghost) return;

    // Available width inside the nav pill (subtract padding + border)
    const navStyle = getComputedStyle(nav);
    const padLeft = parseFloat(navStyle.paddingLeft) || 7;
    const padRight = parseFloat(navStyle.paddingRight) || 7;
    const gap = parseFloat(navStyle.gap) || 4;
    const availWidth = nav.clientWidth - padLeft - padRight;

    // Measure the "Más" button width from the ghost (always full-size)
    const moreWidth = ghostMoreRef.current
      ? ghostMoreRef.current.getBoundingClientRect().width
      : 70;

    // Measure every item width from the ghost (always in normal flow)
    const itemWidths = ghostItemRefs.current.map((el) =>
      el ? el.getBoundingClientRect().width : 70,
    );

    // Greedy fit: add items left-to-right while they fit + "Más" button
    let used = 0;
    let count = 0;

    for (let i = 0; i < ALL_NAV_ITEMS.length; i++) {
      const gapCost = count === 0 ? 0 : gap;
      const candidate = used + gapCost + itemWidths[i];
      // Always reserve space for "Más" button + one gap
      const withMore = candidate + gap + moreWidth;

      if (withMore <= availWidth) {
        used = candidate;
        count = i + 1;
      } else {
        break;
      }
    }

    setVisibleCount(Math.max(1, count));
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setTimeout(computeVisibleCount, 30);

    /**
     * Observe the CONTAINER div (parent of the nav pill), not the nav itself.
     * The container is full-width and always reflects the true available space,
     * even when the nav pill has shrunk. This fires correctly on both shrink
     * AND grow.
     */
    const container = navRef.current?.parentElement;
    const observer = new ResizeObserver(() => computeVisibleCount());
    if (container) observer.observe(container);

    return () => {
      clearTimeout(id);
      observer.disconnect();
    };
  }, [computeVisibleCount]);

  // Recompute on pathname change (badges could affect item widths)
  useEffect(() => {
    const id = setTimeout(computeVisibleCount, 50);
    return () => clearTimeout(id);
  }, [pathname, computeVisibleCount]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMoreMenu) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !menuRef.current?.contains(t) &&
        !moreButtonRef.current?.contains(t)
      ) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showMoreMenu]);

  // ─── Derived state ───────────────────────────────────────────────────────────

  const visibleItems = ALL_NAV_ITEMS.slice(0, visibleCount);
  const hiddenItems = ALL_NAV_ITEMS.slice(visibleCount);

  const isActive = (url: string) =>
    url === "/study" ? pathname === "/study" : pathname.startsWith(url);

  const hasActiveHidden = hiddenItems.some((item) => isActive(item.url));

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleLogout = useCallback(async () => {
    try {
      await apiService.logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push("/auth");
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      {/*
        ── GHOST MEASUREMENT CONTAINER ──────────────────────────────────────────
        Positioned off-screen, never visible, never interactive.
        Always renders ALL items at their natural full size so we can measure
        them accurately regardless of what visibleCount currently is.
        This is what makes both shrink AND grow work correctly.
      */}
      <div ref={ghostRef} className={styles.ghost} aria-hidden="true">
        {ALL_NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.url}
              ref={(el) => {
                ghostItemRefs.current[index] = el;
              }}
              className={styles.navItem}
            >
              <div className={styles.navIconWrapper}>
                <Icon size={22} />
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </div>
              <span className={styles.navLabel}>{item.title}</span>
            </div>
          );
        })}
        {/* Ghost "Más" button for width measurement */}
        <div ref={ghostMoreRef} className={styles.moreButton}>
          <MoreHorizontal size={22} />
          <span className={styles.navLabel}>Más</span>
        </div>
      </div>

      {/* ── REAL NAV PILL ──────────────────────────────────────────────────────── */}
      <nav ref={navRef} className={styles.bottomNav}>
        {/* Only the items that actually fit */}
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          return (
            <Link
              key={item.url}
              href={item.url}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
              onClick={() => setShowMoreMenu(false)}
            >
              <div className={styles.navIconWrapper}>
                <Icon size={22} />
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </div>
              <span className={styles.navLabel}>{item.title}</span>
            </Link>
          );
        })}

        {/* "Más" button — always visible */}
        <button
          ref={moreButtonRef}
          className={`${styles.moreButton} ${showMoreMenu ? styles.moreButtonActive : ""}`}
          onClick={() => setShowMoreMenu((p) => !p)}
          aria-label="Más opciones"
          aria-expanded={showMoreMenu}
        >
          <MoreHorizontal size={22} />
          <span className={styles.navLabel}>Más</span>
          {hasActiveHidden && <span className={styles.moreActiveDot} />}

          {/* Floating "Más" menu */}
          {showMoreMenu && (
            <div
              ref={menuRef}
              className={styles.moreMenu}
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              {hiddenItems.length > 0 && (
                <>
                  <div className={styles.moreMenuSection}>
                    {hiddenItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.url);
                      return (
                        <Link
                          key={item.url}
                          href={item.url}
                          role="menuitem"
                          className={`${styles.moreMenuItem} ${active ? styles.moreMenuItemActive : ""}`}
                          onClick={() => setShowMoreMenu(false)}
                        >
                          <Icon size={18} />
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className={styles.menuBadge}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  <div className={styles.moreMenuDivider} />
                </>
              )}

              <div className={styles.moreMenuSection}>
                <button
                  role="menuitem"
                  className={styles.moreMenuItem}
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={18} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </button>
      </nav>
    </div>
  );
}

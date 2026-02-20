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

  // One ref per nav item (rendered always, but some will be off-screen via aria-hidden)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ─── Measurement ────────────────────────────────────────────────────────────

  /**
   * Renders ALL items invisibly so we can measure their real widths,
   * then computes how many actually fit.
   */
  const computeVisibleCount = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    // nav has padding: 7px on each side = 14px total, plus gap: 4px between items
    const navStyle = getComputedStyle(nav);
    const paddingLeft = parseFloat(navStyle.paddingLeft) || 7;
    const paddingRight = parseFloat(navStyle.paddingRight) || 7;
    const gap = parseFloat(navStyle.gap) || 4;

    const availableWidth = nav.clientWidth - paddingLeft - paddingRight;

    const moreWidth = moreButtonRef.current
      ? moreButtonRef.current.getBoundingClientRect().width
      : 70;

    // Gather item widths (only those whose refs are mounted)
    const itemWidths = itemRefs.current.map((el) =>
      el ? el.getBoundingClientRect().width : 70,
    );

    // Greedily add items (left to right) while they fit alongside the "Más" button
    let used = 0;
    let count = 0;

    for (let i = 0; i < ALL_NAV_ITEMS.length; i++) {
      const gapCost = count === 0 ? 0 : gap;
      const candidate = used + gapCost + itemWidths[i];
      // Reserve space for "Más" button (always present) + its gap
      const withMore = candidate + gap + moreWidth;

      if (withMore <= availableWidth) {
        used = candidate;
        count = i + 1;
      } else {
        break;
      }
    }

    // Edge-case: if nothing fits, show at least 1 item
    setVisibleCount(Math.max(1, count));
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Delay slightly so the DOM has settled and getBoundingClientRect is accurate
    const id = setTimeout(computeVisibleCount, 30);

    const observer = new ResizeObserver(() => {
      computeVisibleCount();
    });

    if (navRef.current) observer.observe(navRef.current);

    return () => {
      clearTimeout(id);
      observer.disconnect();
    };
  }, [computeVisibleCount]);

  // Recompute when pathname changes (badges might affect sizes)
  useEffect(() => {
    const id = setTimeout(computeVisibleCount, 50);
    return () => clearTimeout(id);
  }, [pathname, computeVisibleCount]);

  // Close "Más" menu when clicking outside
  useEffect(() => {
    if (!showMoreMenu) return;

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedMenu = menuRef.current?.contains(target);
      const clickedButton = moreButtonRef.current?.contains(target);
      if (!clickedMenu && !clickedButton) setShowMoreMenu(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
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
      <nav ref={navRef} className={styles.bottomNav}>
        {/*
          We render ALL items in the DOM (for measurement) but hide the overflow ones.
          Using visibility + pointer-events instead of display:none so getBoundingClientRect works.
        */}
        {ALL_NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          const hidden = index >= visibleCount;

          return (
            <Link
              key={item.url}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              href={item.url}
              aria-hidden={hidden}
              tabIndex={hidden ? -1 : undefined}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""} ${hidden ? styles.navItemHidden : ""}`}
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

          {/* Floating menu */}
          {showMoreMenu && (
            <div
              ref={menuRef}
              className={styles.moreMenu}
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hidden nav items (if any) */}
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

              {/* Logout — always present */}
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

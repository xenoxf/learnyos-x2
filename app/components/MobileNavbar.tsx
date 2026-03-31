"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageSquare,
  Brain,
  CreditCard,
  NotebookPen,
  MoreHorizontal,
  Settings2,
  Book,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/mobileNavbar.module.css";
import Link from "next/link";
import { ThemeToggleSidebr } from "./ThemeToogleSidebr";

const RESIZE_DEBOUNCE = 100;

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

const ALL_NAV_ITEMS: MenuItem[] = [
  { title: "Klerk", url: "/study", icon: Book },
  { title: "Chat", url: "/study/chat", icon: MessageSquare, badge: 3 },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
];

export function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [visibleCount, setVisibleCount] = useState(ALL_NAV_ITEMS.length);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const itemWidthsRef = useRef<number[]>([]);
  const moreButtonWidthRef = useRef(70);

  const measureItems = useCallback(() => {
    if (!navRef.current) return;
    const items = navRef.current.querySelectorAll(`.${styles.navItem}`);
    const moreButton = moreButtonRef.current;

    if (items.length > 0) {
      itemWidthsRef.current = Array.from(items).map(
        (item) => item.getBoundingClientRect().width + 4,
      );
    }
    if (moreButton) {
      moreButtonWidthRef.current = moreButton.getBoundingClientRect().width + 4;
    }
  }, []);

  const computeVisibleCount = useCallback(() => {
    if (!navRef.current || itemWidthsRef.current.length === 0) return;
    const navWidth = navRef.current.clientWidth;
    let usedWidth = moreButtonWidthRef.current;
    let count = 0;

    for (let i = 0; i < itemWidthsRef.current.length; i++) {
      const candidateWidth = usedWidth + itemWidthsRef.current[i];
      if (candidateWidth <= navWidth) {
        usedWidth = candidateWidth;
        count = i + 1;
      } else {
        break;
      }
    }
    setVisibleCount(Math.max(1, count));
  }, []);

  useEffect(() => {
    setIsMeasuring(true);
    const timeoutId = setTimeout(() => {
      measureItems();
      computeVisibleCount();
      setIsMeasuring(false);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [pathname, measureItems, computeVisibleCount]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        measureItems();
        computeVisibleCount();
      }, RESIZE_DEBOUNCE);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureItems, computeVisibleCount]);

  // Manejo de click outside para cerrar el menú
  useEffect(() => {
    if (!showMoreMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        moreButtonRef.current?.contains(target)
      ) {
        return;
      }
      setShowMoreMenu(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMoreMenu]);

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

  const visibleItems = useMemo(
    () => ALL_NAV_ITEMS.slice(0, visibleCount),
    [visibleCount],
  );
  const hiddenItems = useMemo(
    () => ALL_NAV_ITEMS.slice(visibleCount),
    [visibleCount],
  );

  const isActive = useCallback(
    (url: string) =>
      url === "/study" ? pathname === "/study" : pathname.startsWith(url),
    [pathname],
  );

  const hasActiveHidden = useMemo(
    () => hiddenItems.some((item) => isActive(item.url)),
    [hiddenItems, isActive],
  );

  return (
    <nav ref={navRef} className={styles.bottomNav}>
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.url}
            href={item.url}
            className={`${styles.navItem} ${isActive(item.url) ? styles.navItemActive : ""}`}
            onClick={() => setShowMoreMenu(false)}
          >
            <div className={styles.navIconWrapper}>
              <Icon size={22} />
              {item.badge && <span className={styles.badge}>{item.badge}</span>}
            </div>
            <span className={styles.navLabel}>{item.title}</span>
          </Link>
        );
      })}

      <button
        ref={moreButtonRef}
        className={`${styles.moreButton} ${showMoreMenu ? styles.moreButtonActive : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowMoreMenu((prev) => !prev);
        }}
        aria-expanded={showMoreMenu}
      >
        <MoreHorizontal size={22} />
        <span className={styles.navLabel}>Más</span>
        {hasActiveHidden && <span className={styles.moreActiveDot} />}
      </button>

      {showMoreMenu && (
        <div ref={menuRef} className={styles.moreMenu}>
          {hiddenItems.length > 0 && (
            <>
              <div className={styles.moreMenuSection}>
                {hiddenItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      className={`${styles.moreMenuItem} ${isActive(item.url) ? styles.moreMenuItemActive : ""}`}
                      onClick={() => setShowMoreMenu(false)}
                    >
                      <Icon size={18} />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={styles.menuBadge}>{item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
              <div className={styles.moreMenuDivider} />
            </>
          )}

          <div className={styles.moreMenuSection}>
            <div
              className={styles.themeToggleWrapper}
              onClick={(e) => e.stopPropagation()}
            >
              <ThemeToggleSidebr isCollapse={false} />
            </div>

            <Link
              className={styles.moreMenuItem}
              href="/study/settings"
              onClick={() => setShowMoreMenu(false)}
            >
              <Settings2 size={18} />
              <span>Configuración</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

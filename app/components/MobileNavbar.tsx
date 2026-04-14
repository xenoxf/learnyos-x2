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
import { toast } from "@/hooks/useLocalToast";
import styles from "@/styles/mobileNavbar.module.css";
import Link from "next/link";
import { ThemeToggleSidebr } from "./ThemeToogleSidebr";
import { authService } from "@/services/authService";

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
  const [visibleCount, setVisibleCount] = useState(ALL_NAV_ITEMS.length);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ right: 16, bottom: 60 });

  const navRef = useRef<HTMLElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const itemWidthsRef = useRef<number[]>([]);
  const moreWidthRef = useRef(70);

  const rafRef = useRef<number>();

  // 🔥 Medir UNA sola vez
  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    const items = nav.querySelectorAll(`.${styles.navItem}`);

    itemWidthsRef.current = Array.from(
      items,
      (el) => el.getBoundingClientRect().width + 4,
    );

    if (moreButtonRef.current) {
      moreWidthRef.current =
        moreButtonRef.current.getBoundingClientRect().width + 4;
    }
  }, []);

  // ⚡ Cálculo eficiente
  const compute = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    const navWidth = nav.clientWidth;
    let used = moreWidthRef.current;
    let count = 0;

    for (const width of itemWidthsRef.current) {
      if (used + width > navWidth) break;
      used += width;
      count++;
    }

    setVisibleCount(count || 1);
  }, []);

  // 🧠 Recalculo suave
  const scheduleCompute = useCallback(() => {
    cancelAnimationFrame(rafRef.current!);
    rafRef.current = requestAnimationFrame(compute);
  }, [compute]);

  // 🚀 Init + observer
  useEffect(() => {
    if (!navRef.current) return;

    measure();
    compute();

    const observer = new ResizeObserver(scheduleCompute);
    observer.observe(navRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current!);
    };
  }, [measure, compute, scheduleCompute]);

  // 🔁 Recalcular en cambio de ruta
  useEffect(() => {
    measure();
    compute();
  }, [pathname, measure, compute]);

  // 👇 Click outside
  useEffect(() => {
    if (!showMoreMenu) return;

    const handler = (e: any) => {
      const target = e.target;

      // Verificar si el click está dentro de un dropdown/menu de Radix (portal)
      const isDropdownMenu =
        target.closest("[data-radix-dropdown-menu-content]") ||
        target.closest("[data-radix-portal]") ||
        target.closest("[role='menu']") ||
        target.closest("[role='menuitem']");

      if (
        menuRef.current?.contains(target) ||
        moreButtonRef.current?.contains(target) ||
        isDropdownMenu // 👈 AGREGAR ESTA VERIFICACIÓN
      )
        return;

      setShowMoreMenu(false);
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showMoreMenu]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      toast.success("Sesión cerrada", "Has cerrado sesión correctamente");
      router.push("/auth");
    } catch {
      toast.error("Error", "No se pudo cerrar la sesión");
    }
  }, [router]);

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
      url === "/study" ? pathname === url : pathname.startsWith(url),
    [pathname],
  );

  const hasActiveHidden = hiddenItems.some((i) => isActive(i.url));

  const toggleMenu = useCallback((e: any) => {
    e.stopPropagation();
    setShowMoreMenu((p) => !p);
  }, []);

  // 📍 Posición menú
  useEffect(() => {
    if (!showMoreMenu || !moreButtonRef.current) return;

    const rect = moreButtonRef.current.getBoundingClientRect();

    setMenuPosition({
      right: Math.max(8, window.innerWidth - rect.right),
      bottom: window.innerHeight - rect.top + 8,
    });
  }, [showMoreMenu]);

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
              <Icon size={18} />
              {item.badge && <span className={styles.badge}>{item.badge}</span>}
            </div>
            <span className={styles.navLabel}>{item.title}</span>
          </Link>
        );
      })}

      <button
        ref={moreButtonRef}
        className={`${styles.moreButton} ${showMoreMenu ? styles.moreButtonActive : ""}`}
        onClick={toggleMenu}
      >
        <MoreHorizontal size={18} />
        <span className={styles.navLabel}>Más</span>
        {hasActiveHidden && <span className={styles.moreActiveDot} />}
      </button>

      {showMoreMenu && (
        <div
          ref={menuRef}
          className={styles.moreMenu}
          style={{
            position: "fixed",
            right: menuPosition.right,
            bottom: menuPosition.bottom,
            zIndex: 1000,
          }}
        >
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
                      <Icon size={16} />
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
              onTouchStart={(e) => e.stopPropagation()}
            >
              <ThemeToggleSidebr isCollapse={false} />
            </div>

            <Link
              href="/study/espacio/general"
              className={styles.moreMenuItem}
              onClick={() => setShowMoreMenu(false)}
            >
              <Settings2 size={16} />
              <span>Mi Espacio</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

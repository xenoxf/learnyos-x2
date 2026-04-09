"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Settings2, MessageSquare, Brain, CreditCard, NotebookPen, Book, LogOut } from "lucide-react";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/useLocalToast";
import { ThemeToggleSidebr } from "./ThemeToogleSidebr";
import styles from "@/styles/mobileNavbarV2.module.css";
import Link from "next/link";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const NAV_ITEMS: MenuItem[] = [
  { title: "Klerk", url: "/study", icon: Book },
  { title: "Chat", url: "/study/chat", icon: MessageSquare },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
];

export function MobileNavbarV2() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const isActive = useCallback(
    (url: string) => url === "/study" ? pathname === url : pathname?.startsWith(url + "/"),
    [pathname],
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((p) => !p);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiService.logout();
      toast.success("Sesión cerrada", "Has cerrado sesión correctamente");
      router.push("/auth");
    } catch {
      toast.error("Error", "No se pudo cerrar la sesión");
    }
  }, [router]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, handleClose]);

  // Close on route change
  useEffect(() => {
    handleClose();
  }, [pathname, handleClose]);

  return (
    <nav className={styles.bottomNav}>
      {/* Main nav items */}
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.url);
        return (
          <Link
            key={item.url}
            href={item.url}
            className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
          >
            <div className={styles.navIconWrapper}>
              <Icon size={18} />
            </div>
            <span className={styles.navLabel}>{item.title}</span>
          </Link>
        );
      })}

      {/* Drop button - right side */}
      <button
        ref={btnRef}
        className={`${styles.dropBtn} ${isOpen ? styles.dropBtnOpen : ""}`}
        onClick={toggleOpen}
        type="button"
        aria-label="Menú"
      >
        <svg viewBox="0 0 24 24" className={styles.dropIcon} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Slide-in sidebar */}
      {isOpen && (
        <div ref={menuRef} className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>

          <div className={styles.sidebarDivider} />

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarThemeToggle}>
              <ThemeToggleSidebr isCollapse={false} />
            </div>

            <Link href="/study/espacio/general" className={styles.sidebarItem}>
              <Settings2 size={18} />
              <span>Mi Espacio</span>
            </Link>

            <button className={styles.sidebarItem} onClick={handleLogout} type="button">
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

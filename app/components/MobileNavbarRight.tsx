"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Settings2,
  MessageSquare,
  Brain,
  CreditCard,
  NotebookPen,
  Book,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { toast } from "@/hooks/useLocalToast";
import { ThemeToggleSidebr } from "./ThemeToogleSidebr";
import styles from "@/styles/mobileNavbarRight.module.css";
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
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
];

export function MobileNavbarRight() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isActive = useCallback(
    (url: string) =>
      url === "/study" ? pathname === url : pathname?.startsWith(url + "/"),
    [pathname],
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((p) => !p);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on route change
  useEffect(() => {
    handleClose();
  }, [pathname, handleClose]);

  return (
    <>
      {/* Drop button - right side of screen */}
      <button
        className={`${styles.dropButton} ${isOpen ? styles.dropButtonOpen : ""}`}
        onClick={toggleOpen}
        type="button"
        aria-label="Abrir menú"
      >
        <Menu size={29} className={styles.dropIcon} />
      </button>

      {/* Sidebar from right */}
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={handleClose} />
          <div ref={sidebarRef} className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarTitle}>Menú</span>
              <button
                className={styles.closeBtn}
                onClick={handleClose}
                type="button"
                aria-label="Cerrar"
              >
                <ChevronLeft size={29} />
              </button>
            </div>

            <nav className={styles.sidebarNav}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : ""}`}
                    onClick={handleClose}
                  >
                    <Icon size={20} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            <div className={styles.sidebarDivider} />

            <div className={styles.sidebarFooter}>
              <Link
                href="/study/espacio"
                className={styles.sidebarItem}
                onClick={handleClose}
              >
                <Settings2 size={20} />
                <span>Mi Espacio</span>
              </Link>
              <div className={styles.sidebarThemeToggle}>
                <ThemeToggleSidebr isCollapse={false} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

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
  User,
  Settings,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/mobileNavbar.module.css";
import { useAuth } from "@/hooks/useAuthMutation";
import Link from "next/link";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

// Elementos que siempre se muestran en la barra inferior
const primaryNavItems: MenuItem[] = [
  { title: "Inicio", url: "/study", icon: LayoutDashboard },
  { title: "Chat", url: "/study/chat", icon: MessageSquare, badge: 3 },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
];

// Elementos secundarios que van en el menú "Más" (navegación)
const secondaryNavItems: MenuItem[] = [
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
  { title: "Traductor", url: "/study/translator", icon: Languages },
];

export function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const user = useAuth(); // Aunque no se use directamente, se mantiene por si acaso

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMoreMenu]);

  // Posicionar el menú centrado respecto al botón "Más"
  useEffect(() => {
    if (showMoreMenu && moreButtonRef.current && containerRef.current) {
      const buttonRect = moreButtonRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const menuWidth = 200; // Ancho aproximado del menú
      let left =
        buttonRect.left -
        containerRect.left +
        buttonRect.width / 2 -
        menuWidth / 2;
      // Evitar que se salga por la izquierda/derecha
      left = Math.max(8, Math.min(left, containerRect.width - menuWidth - 8));
      setMenuPosition({ left });
    }
  }, [showMoreMenu]);
  /*
    const handleNavigation = useCallback(
      (url: string) => {
        if (pathname === url) return;
        setShowMoreMenu(false);
        router.push(url);
      },
      [pathname, router],
    );*/

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

  const toggleMoreMenu = () => {
    setShowMoreMenu((prev) => !prev);
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <nav className={styles.bottomNav}>
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.url}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              href={item.url}
              aria-label={item.title}
            >
              <div className={styles.navIconWrapper}>
                <Icon size={20} />
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </div>
              <span className={styles.navLabel}>{item.title}</span>
            </Link>
          );
        })}

        <button
          ref={moreButtonRef}
          className={`${styles.moreButton} ${showMoreMenu ? styles.moreButtonActive : ""}`}
          onClick={toggleMoreMenu}
          aria-label="Más opciones"
          aria-expanded={showMoreMenu}
        >
          <MoreHorizontal size={20} />
          <span className={styles.navLabel}>Más</span>
        </button>
      </nav>

      {showMoreMenu && (
        <div
          ref={menuRef}
          className={styles.moreMenu}
          style={{ left: menuPosition.left }}
        >
          <div className={styles.moreMenuSection}>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.url}
                  className={styles.moreMenuItem}
                  href={item.url}
                >
                  <Icon size={18} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>

          <div className={styles.moreMenuDivider} />

          <div className={styles.moreMenuSection}>
            <button className={styles.moreMenuItem} onClick={handleLogout}>
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Coins,
  FileText,
  CreditCard,
  Brain,
  TrendingUp,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface EspacioNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  children?: {
    id: string;
    label: string;
    icon: React.ElementType;
    href: string;
  }[];
}

const NAV_ITEMS: EspacioNavItem[] = [
  { id: "general", label: "General", icon: Settings, href: "/study/espacio" },
  {
    id: "creditos",
    label: "Mis Créditos",
    icon: Coins,
    href: "/study/espacio/creditos",
  },
  {
    id: "funciones",
    label: "Mis Funciones",
    icon: FileText,
    href: "#",
    children: [
      {
        id: "flashcards",
        label: "Flashcards",
        icon: CreditCard,
        href: "/study/espacio/funciones/flashcards",
      },
      {
        id: "notas",
        label: "Notas",
        icon: FileText,
        href: "/study/espacio/funciones/notas",
      },
      {
        id: "quizzes",
        label: "Quizzes",
        icon: Brain,
        href: "/study/espacio/funciones/quizzes",
      },
    ],
  },
  {
    id: "rendimiento",
    label: "Mi Rendimiento",
    icon: TrendingUp,
    href: "/study/espacio/rendimiento",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [funcionesExpanded, setFuncionesExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isActive = useCallback(
    (href: string): boolean =>
      pathname === href || pathname?.startsWith(href + "/"),
    [pathname],
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const funcionesParent = NAV_ITEMS.find((i) => i.id === "funciones");
    if (funcionesParent?.children) {
      const hasActiveChild = funcionesParent.children.some((c) =>
        isActive(c.href),
      );
      if (hasActiveChild) setFuncionesExpanded(true);
    }
  }, [pathname, isActive]);

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const toggleFunciones = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setFuncionesExpanded((p) => !p);
  }, []);

  const renderNavItems = useMemo(() => {
    return NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.href);

      if (item.children) {
        return (
          <div key={item.id} className={styles.navGroup}>
            <button
              className={`${styles.navGroupHeader} ${funcionesExpanded ? styles.navGroupExpanded : ""} ${active ? styles.navGroupActive : ""}`}
              onClick={toggleFunciones}
              type="button"
            >
              <div className={styles.navItemContent}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              <ChevronDown
                size={14}
                className={`${styles.groupArrow} ${funcionesExpanded ? styles.groupArrowOpen : ""}`}
              />
            </button>
            <div className={`${styles.navGroupChildren} ${funcionesExpanded ? styles.show : ""}`}>
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const childActive = isActive(child.href);
                return (
                  <Link
                    key={child.id}
                    href={child.href}
                    className={`${styles.navGroupChild} ${childActive ? styles.navGroupChildActive : ""}`}
                    onClick={closeSidebar}
                  >
                    <ChildIcon size={16} />
                    <span>{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      }

      return (
        <Link
          key={item.id}
          href={item.href}
          className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
          onClick={closeSidebar}
        >
          <Icon size={18} />
          <span>{item.label}</span>
        </Link>
      );
    });
  }, [isActive, funcionesExpanded, toggleFunciones, closeSidebar]);

  return (
    <>
      <button
        className={styles.mobileMenuBtn}
        onClick={toggleSidebar}
        type="button"
        aria-label="Menú"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon} />
            <span className={styles.logoText}>Mi Espacio</span>
          </div>
        </div>
        <nav className={styles.nav}>{renderNavItems}</nav>
        <div className={styles.footer}>
          <p>© 2026 LearnyOS</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

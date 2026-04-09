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
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import styles from "@/styles/espacio/espacioLayout.module.css";

interface EspacioNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  children?: { id: string; label: string; icon: React.ElementType; href: string }[];
}

const NAV_ITEMS: EspacioNavItem[] = [
  { id: "general", label: "General", icon: Settings, href: "/study/espacio/general" },
  { id: "creditos", label: "Mis Créditos", icon: Coins, href: "/study/espacio/creditos" },
  {
    id: "funciones",
    label: "Mis Funciones",
    icon: FileText,
    href: "#",
    children: [
      { id: "flashcards", label: "Flashcards", icon: CreditCard, href: "/study/espacio/funciones/flashcards" },
      { id: "notas", label: "Notas", icon: FileText, href: "/study/espacio/funciones/notas" },
      { id: "quizzes", label: "Quizzes", icon: Brain, href: "/study/espacio/funciones/quizzes" },
    ],
  },
  { id: "rendimiento", label: "Mi Rendimiento", icon: TrendingUp, href: "/study/espacio/rendimiento" },
  { id: "terminos", label: "Términos", icon: Shield, href: "/study/espacio/terminos" },
];

export default function EspacioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [funcionesExpanded, setFuncionesExpanded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isActive = useCallback(
    (href: string): boolean => pathname === href || pathname?.startsWith(href + "/"),
    [pathname],
  );

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load sidebar collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("espacio-sidebar-collapsed");
      if (saved !== null) setSidebarCollapsed(saved === "true");
    } catch {}
  }, []);

  // Auto-expand funciones if a child is active
  useEffect(() => {
    const funcionesParent = NAV_ITEMS.find((i) => i.id === "funciones");
    if (funcionesParent?.children) {
      const hasActiveChild = funcionesParent.children.some((c) => isActive(c.href));
      setFuncionesExpanded(hasActiveChild);
    }
  }, [pathname, isActive]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((p) => !p);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleFunciones = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setFuncionesExpanded((p) => !p);
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const newVal = !prev;
      try {
        localStorage.setItem("espacio-sidebar-collapsed", String(newVal));
      } catch {}
      return newVal;
    });
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const renderNavItems = useMemo(() => {
    return NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.href);

      // Parent with children (expandable)
      if (item.children) {
        return (
          <div key={item.id} className={styles.navGroup}>
            <button
              className={`${styles.navGroupHeader} ${funcionesExpanded ? styles.navGroupExpanded : ""}`}
              onClick={toggleFunciones}
              type="button"
            >
              <Icon size={18} />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && (
                <ChevronDown
                  size={14}
                  className={`${styles.groupArrow} ${funcionesExpanded ? styles.groupArrowOpen : ""}`}
                />
              )}
            </button>
            {funcionesExpanded && !sidebarCollapsed && (
              <div className={styles.navGroupChildren}>
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
            )}
          </div>
        );
      }

      // Regular nav item
      return (
        <Link
          key={item.id}
          href={item.href}
          className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
          onClick={closeSidebar}
          title={sidebarCollapsed ? item.label : undefined}
        >
          <Icon size={18} />
          {!sidebarCollapsed && <span>{item.label}</span>}
        </Link>
      );
    });
  }, [isActive, funcionesExpanded, sidebarCollapsed, toggleFunciones, closeSidebar]);

  return (
    <div className={styles.espacioContainer}>
      {/* Mobile header with menu button */}
      <header className={styles.espacioMobileHeader}>
        <button className={styles.mobileMenuBtn} onClick={toggleSidebar} type="button" aria-label="Abrir menú">
          <Menu size={24} />
        </button>
        <span className={styles.mobileHeaderTitle}>Mi Espacio</span>
      </header>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={closeSidebar} />}

      <aside className={`${styles.espacioSidebar} ${sidebarOpen ? styles.sidebarOpen : ""} ${sidebarCollapsed && !isMobile ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Mi Espacio</span>
          <div className={styles.sidebarHeaderActions}>
            {!isMobile && (
              <button
                className={styles.collapseBtn}
                onClick={toggleSidebarCollapse}
                type="button"
                aria-label={sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
                title={sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
              >
                {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
              </button>
            )}
            <button className={styles.sidebarCloseBtn} onClick={closeSidebar} type="button" aria-label="Cerrar menú">
              <X size={20} />
            </button>
          </div>
        </div>
        <nav className={styles.espacioNav}>
          {renderNavItems}
        </nav>
      </aside>

      {/* Collapse toggle button for desktop - positioned on the edge */}
      {!isMobile && (
        <button
          className={`${styles.espacioSidebarToggle} ${sidebarCollapsed ? styles.espacioSidebarToggleCollapsed : ""}`}
          onClick={toggleSidebarCollapse}
          type="button"
          aria-label={sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {sidebarCollapsed ? <ChevronLeft size={18} /> : <ChevronLeft size={18} style={{ transform: 'rotate(180deg)' }} />}
        </button>
      )}

      <main className={styles.espacioMain}>
        {children}
      </main>
    </div>
  );
}

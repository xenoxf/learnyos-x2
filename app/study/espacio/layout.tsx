"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Coins,
  FileText,
  CreditCard,
  Brain,
  TrendingUp,
  LayoutDashboard,
  ChevronRight
} from "lucide-react";
import styles from "@/styles/espacio/espacioLayout.module.css";

interface EspacioNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const NAV_ITEMS: EspacioNavItem[] = [
  { id: "general", label: "General", icon: LayoutDashboard, href: "/study/espacio" },
  { id: "creditos", label: "Mis Créditos", icon: Coins, href: "/study/espacio/creditos" },
  { id: "flashcards", label: "Mis Flashcards", icon: CreditCard, href: "/study/espacio/funciones/flashcards" },
  { id: "quizzes", label: "Mis Exámenes", icon: Brain, href: "/study/espacio/funciones/quizzes" },
  { id: "rendimiento", label: "Rendimiento", icon: TrendingUp, href: "/study/espacio/rendimiento" },
];

export default function EspacioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isActive = useCallback(
    (href: string): boolean => pathname === href,
    [pathname],
  );

  return (
    <div className={styles.espacioContainer}>
      <div className={styles.espacioWrapper}>
        <aside className={styles.espacioSidebarNav}>
          <div className={styles.sidebarHeader}>
             <h2 className={styles.sidebarTitle}>Configuración</h2>
             <p className={styles.sidebarSubtitle}>Gestiona tu cuenta y herramientas</p>
          </div>
          
          <nav className={styles.navLinks}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                >
                  <div className={styles.linkContent}>
                    <Icon size={18} className={styles.linkIcon} />
                    <span className={styles.linkLabel}>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={styles.arrowIcon} />
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className={styles.espacioContent}>
          <div className={styles.pageContent}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

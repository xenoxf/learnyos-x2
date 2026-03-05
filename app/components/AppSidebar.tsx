"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  CreditCard,
  NotebookPen,
  Languages,
  LogOut,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../styles/sidebar.module.css";
import { ThemeSelector } from "./ThemeSelector";

const menuItems = [
  { title: "Dashboard", url: "/study", icon: LayoutDashboard },
  { title: "Junior IA", url: "/study/chat", icon: MessageSquare },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
  { title: "Traductor", url: "/study/translator", icon: Languages },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

interface User {
  id?: number;
  name?: string;
  email?: string;
  picture?: string;
}

export function AppSidebar({
  collapsed = false,
  onToggle,
  onNavigate,
}: AppSidebarProps) {
  const navigate = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [sidebarClosed, setSidebarClosed] = useState(collapsed);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setSidebarClosed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    apiService.logout();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
    navigate.push("/auth");
  };

  const handleNavigation = (url: string) => {
    navigate.push(url);
    onNavigate?.();
  };

  const toggleSidebar = () => {
    setSidebarClosed(!sidebarClosed);
    onToggle?.();
  };

  const isActiveRoute = (url: string): boolean => {
    return pathname === url || pathname?.startsWith(url + "/");
  };

  return (
    <aside
      className={`
        ${styles.sidebar}
        ${sidebarClosed ? styles.sidebarCollapsed : styles.sidebarExpanded}
      `}
      aria-label="Menú principal de navegación"
    >
      {/* Header */}
      <div className={styles.header} onClick={toggleSidebar}>
        <div className={styles.headerContent}>
          <div className={styles.logo} aria-hidden="true">
            L
          </div>
          {!sidebarClosed && <span className={styles.logoText}>LearnYos</span>}
        </div>
        {!sidebarClosed && (
          <button
            className={styles.closeButton}
            aria-label="Contraer sidebar"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Herramientas de estudio">
        <div className={styles.navList}>
          {!sidebarClosed && (
            <div className={styles.navLabel} aria-hidden="true">
              HERRAMIENTAS
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.url);

            return (
              <Link
                key={item.url}
                href={item.url}
                className={`
                  ${styles.navItem}
                  ${isActive ? styles.navItemActive : styles.navItemInactive}
                  ${sidebarClosed ? styles.navItemCollapsed : styles.navItemExpanded}
                `}
                title={item.title}
                aria-label={item.title}
              >
                <Icon
                  size={20}
                  className={styles.navItemIcon}
                  aria-hidden="true"
                />
                {!sidebarClosed && (
                  <span className={styles.navItemText}>{item.title}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - User Info & Actions */}
      <div className={styles.footer}>
        <div
          className={`
            ${styles.userInfo}
            ${sidebarClosed ? styles.userInfoCollapsed : styles.userInfoExpanded}
          `}
        >
          <div className={styles.userAvatar} aria-hidden="true">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!sidebarClosed && (
            <div className={styles.userDetails}>
              <div className={styles.userName} aria-label="Nombre de usuario">
                {user?.name}
              </div>
              <div className={styles.userEmail} aria-label="Email del usuario">
                {user?.email}
              </div>
            </div>
          )}
        </div>
        <div
          className={`${sidebarClosed ? styles.actions : styles.actionsCollapsed}`}
        >
          <button
            onClick={handleLogout}
            className={`
              ${styles.actionButton}
              ${sidebarClosed ? styles.actionButtonCollapsed : styles.actionButtonExpanded}
            `}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            type="button"
          >
            <LogOut size={14} aria-hidden="true" />
            {!sidebarClosed && <span>Salir</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

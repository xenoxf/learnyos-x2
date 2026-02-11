/*"use client";
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
import { SettingsModal } from "@/components/SettingsModal";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../styles/sidebar.module.css";

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
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarClosed, setSidebarClosed] = useState(collapsed);
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Cargar usuario del localStorage
    if (typeof window === "undefined") return;

    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // Detectar tema oscuro
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      const prefersLight = window.matchMedia(
        "(prefers-color-scheme: light)",
      ).matches;
      setIsDark(hasDarkClass && !prefersLight);
    };

    checkDarkMode();

    // Observer para cambios de tema
    const observer = new MutationObserver(() => checkDarkMode());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
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
    >
      {/* Header
      <div className={styles.header} onClick={toggleSidebar}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>L</div>
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

      {/* Navigation
      <nav className={styles.nav}>
        <div className={styles.navList}>
          {!sidebarClosed && (
            <div className={styles.navLabel}>HERRAMIENTAS</div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => handleNavigation(item.url)}
                className={`
                  ${styles.navItem}
                  ${isActive ? styles.navItemActive : styles.navItemInactive}
                  ${sidebarClosed ? styles.navItemCollapsed : styles.navItemExpanded}
                `}
                title={item.title}
              >
                <Icon size={20} className={styles.navItemIcon} />
                {!sidebarClosed && (
                  <span className={styles.navItemText}>{item.title}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - User Info & Actions
      <div className={styles.footer}>
        <div
          className={`
            ${styles.userInfo}
            ${sidebarClosed ? styles.userInfoCollapsed : styles.userInfoExpanded}
          `}
        >
          <div className={styles.userAvatar}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!sidebarClosed && (
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.name || "Usuario"}</div>
              <div className={styles.userEmail}>
                {user?.email || "email@example.com"}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => setShowSettings(true)}
            className={`
              ${styles.actionButton}
              ${styles.settingsButton}
              ${sidebarClosed ? styles.actionButtonCollapsed : styles.actionButtonExpanded}
            `}
            title="Configuración"
            type="button"
          >
            <Settings size={14} />
            {!sidebarClosed && <span>Config</span>}
          </button>
        </div>
      </div>


    </aside>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { SettingsModal } from "@/components/SettingsModal";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../styles/sidebar.module.css";

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
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
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
  isMobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const navigate = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarClosed, setSidebarClosed] = useState(collapsed);
  const [user, setUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cerrar sidebar en móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        onMobileClose
      ) {
        onMobileClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isMobileOpen, onMobileClose]);

  // Cargar usuario
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

    // Cerrar sidebar en móvil después de navegar
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const toggleSidebar = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    } else {
      setSidebarClosed(!sidebarClosed);
      onToggle?.();
    }
  };

  const handleMobileClose = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActiveRoute = (url: string): boolean => {
    return pathname === url || pathname?.startsWith(url + "/");
  };

  // Función para cerrar el modal de configuración
  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Determinar clase sidebar según el estado
  const sidebarClass = isMobile
    ? `${styles.sidebar} ${isMobileOpen ? styles.sidebarExpanded : styles.sidebarCollapsed}`
    : `${styles.sidebar} ${sidebarClosed ? styles.sidebarCollapsed : styles.sidebarExpanded}`;

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={handleMobileClose}
          role="presentation"
          aria-label="Cerrar menú"
        />
      )}

      <aside
        ref={sidebarRef}
        className={sidebarClass}
        aria-label="Menú principal de navegación"
      >
        <div className={styles.header} onClick={toggleSidebar}>
          <div className={styles.headerContent}>
            <div className={styles.logo} aria-hidden="true">
              L
            </div>
            {(!sidebarClosed || isMobile) && (
              <span className={styles.logoText}>LearnYos</span>
            )}
          </div>
          {(!sidebarClosed || isMobile) && (
            <button
              className={styles.closeButton}
              onClick={toggleSidebar}
              aria-label={isMobile ? "Cerrar menú" : "Contraer sidebar"}
              type="button"
            >
              {isMobile ? <X size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
        </div>

        <nav className={styles.nav} aria-label="Herramientas de estudio">
          <div className={styles.navList}>
            {(!sidebarClosed || isMobile) && (
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.url);
                  }}
                  className={`
                    ${styles.navItem}
                    ${isActive ? styles.navItemActive : styles.navItemInactive}
                    ${sidebarClosed && !isMobile ? styles.navItemCollapsed : styles.navItemExpanded}
                  `}
                  title={item.title}
                  aria-label={item.title}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    size={20}
                    className={styles.navItemIcon}
                    aria-hidden="true"
                  />
                  {(!sidebarClosed || isMobile) && (
                    <span className={styles.navItemText}>{item.title}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={styles.footer}>
          <div
            className={`
              ${styles.userInfo}
              ${sidebarClosed && !isMobile ? styles.userInfoCollapsed : styles.userInfoExpanded}
            `}
          >
            <div className={styles.userAvatar} aria-hidden="true">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            {(!sidebarClosed || isMobile) && (
              <div className={styles.userDetails}>
                <div className={styles.userName} aria-label="Nombre de usuario">
                  {user?.name || "Usuario"}
                </div>
                <div
                  className={styles.userEmail}
                  aria-label="Email del usuario"
                >
                  {user?.email || "email@example.com"}
                </div>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => setShowSettings(true)}
              className={`
                ${styles.actionButton}
                ${styles.settingsButton}
                ${sidebarClosed && !isMobile ? styles.actionButtonCollapsed : styles.actionButtonExpanded}
              `}
              title="Configuración"
              aria-label="Abrir configuración"
              type="button"
            >
              <Settings size={14} aria-hidden="true" />
              {(!sidebarClosed || isMobile) && <span>Config</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`
                ${styles.actionButton}
                ${sidebarClosed && !isMobile ? styles.actionButtonCollapsed : styles.actionButtonExpanded}
              `}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              type="button"
            >
              <LogOut size={14} aria-hidden="true" />
              {(!sidebarClosed || isMobile) && <span>Salir</span>}
            </button>
          </div>
        </div>

        <SettingsModal isOpen={showSettings} onClose={handleCloseSettings} />
      </aside>

      {isMobile && !isMobileOpen && (
        <button
          className={styles.mobileToggleButton}
          onClick={() => (onMobileClose ? onMobileClose() : null)}
          aria-label="Abrir menú de navegación"
          type="button"
        >
          <Menu className={styles.mobileToggleIcon} aria-hidden="true" />
        </button>
      )}
    </>
  );
}
*/

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
import { SettingsModal } from "@/components/SettingsModal";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../styles/sidebar.module.css";

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
  const [showSettings, setShowSettings] = useState(false);
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
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.url);
                }}
                className={`
                  ${styles.navItem}
                  ${isActive ? styles.navItemActive : styles.navItemInactive}
                  ${sidebarClosed ? styles.navItemCollapsed : styles.navItemExpanded}
                `}
                title={item.title}
                aria-label={item.title}
                aria-current={isActive ? "page" : undefined}
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
                {user?.name || "Usuario"}
              </div>
              <div className={styles.userEmail} aria-label="Email del usuario">
                {user?.email || "email@example.com"}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => setShowSettings(true)}
            className={`
              ${styles.actionButton}
              ${styles.settingsButton}
              ${sidebarClosed ? styles.actionButtonCollapsed : styles.actionButtonExpanded}
            `}
            title="Configuración"
            aria-label="Abrir configuración"
            type="button"
          >
            <Settings size={14} aria-hidden="true" />
            {!sidebarClosed && <span>Config</span>}
          </button>

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

      {/* Modal de Configuración */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </aside>
  );
}

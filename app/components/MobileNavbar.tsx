"use client";
import React, { useState } from "react";
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
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { SettingsModal } from "@/components/SettingsModal";
import styles from "@/styles/mobileNavbar.module.css";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

const mainMenuItems: MenuItem[] = [
  { title: "Inicio", url: "/study", icon: LayoutDashboard },
  { title: "Chat", url: "/study/chat", icon: MessageSquare },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
];

const secondaryMenuItems: MenuItem[] = [
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
  { title: "Traductor", url: "/study/translator", icon: Languages },
];

export function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
  } | null>(null);

  // Cargar usuario
  React.useEffect(() => {
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

  const handleNavigation = (url: string) => {
    router.push(url);
    setShowMenu(false);
  };

  const handleLogout = () => {
    apiService.logout();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
    router.push("/auth");
  };

  const isActiveRoute = (url: string): boolean => {
    return pathname === url || pathname?.startsWith(url + "/");
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {/* Overlay del menú desplegable */}
      {showMenu && (
        <div
          className={styles.menuOverlay}
          onClick={() => setShowMenu(false)}
          role="presentation"
          aria-label="Cerrar menú"
        />
      )}

      {/* Menú desplegable con opciones secundarias y perfil */}
      <div
        className={`${styles.expandedMenu} ${showMenu ? styles.expandedMenuOpen : ""}`}
      >
        <div className={styles.expandedMenuContent}>
          {/* Perfil de usuario */}
          <div className={styles.userSection}>
            <div className={styles.userAvatar}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name || "Usuario"}</div>
              <div className={styles.userEmail}>
                {user?.email || "email@example.com"}
              </div>
            </div>
          </div>

          {/* Opciones secundarias */}
          <div className={styles.secondaryItems}>
            <div className={styles.sectionLabel}>Más herramientas</div>
            {secondaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.url);

              return (
                <button
                  key={item.url}
                  onClick={() => handleNavigation(item.url)}
                  className={`
                    ${styles.menuItem}
                    ${isActive ? styles.menuItemActive : ""}
                  `}
                >
                  <Icon size={20} className={styles.menuItemIcon} />
                  <span className={styles.menuItemText}>{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Acciones */}
          <div className={styles.actions}>
            <button
              onClick={() => {
                setShowSettings(true);
                setShowMenu(false);
              }}
              className={styles.actionButton}
            >
              <Settings size={18} />
              <span>Configuración</span>
            </button>
            <button onClick={handleLogout} className={styles.actionButton}>
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className={styles.navbar}
        role="navigation"
        aria-label="Navegación principal"
      >
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.url);

          return (
            <button
              key={item.url}
              onClick={() => handleNavigation(item.url)}
              className={`
                ${styles.navItem}
                ${isActive ? styles.navItemActive : ""}
              `}
              aria-label={item.title}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={styles.navItemIconWrapper}>
                <Icon size={24} className={styles.navItemIcon} />
                {item.badge && item.badge > 0 && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </div>
              <span className={styles.navItemLabel}>{item.title}</span>
            </button>
          );
        })}

        {/* Botón de Menú (más opciones) */}
        <button
          onClick={toggleMenu}
          className={`
            ${styles.navItem}
            ${showMenu ? styles.navItemActive : ""}
          `}
          aria-label="Más opciones"
          aria-expanded={showMenu}
        >
          <div className={styles.navItemIconWrapper}>
            <User size={24} className={styles.navItemIcon} />
          </div>
          <span className={styles.navItemLabel}>Menú</span>
        </button>
      </nav>

      {/* Modal de Configuración */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

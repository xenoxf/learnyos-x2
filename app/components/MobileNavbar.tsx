"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { SettingsModal } from "@/components/SettingsModal";
import styles from "@/styles/mobileNavbar.module.css";

// Types
interface UserData {
  name?: string;
  email?: string;
  avatar?: string;
}

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

// Custom hook for user data
const useUser = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  return user;
};

// Menu items configuration - TODOS visibles en el navbar
const navItems: MenuItem[] = [
  { title: "Inicio", url: "/study", icon: LayoutDashboard },
  { title: "Chat", url: "/study/chat", icon: MessageSquare, badge: 3 },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
  { title: "Traductor", url: "/study/translator", icon: Languages },
];

// Main Component
export function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const user = useUser();

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Active route checker
  const isActiveRoute = useCallback(
    (url: string): boolean => {
      return pathname === url || pathname?.startsWith(url + "/");
    },
    [pathname],
  );

  // Handle navigation
  const handleNavigation = useCallback(
    async (url: string) => {
      if (isNavigating) return;

      setIsNavigating(true);
      setShowMenu(false);

      try {
        await router.push(url);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo navegar a la página",
          variant: "destructive",
        });
      } finally {
        setIsNavigating(false);
      }
    },
    [router, toast, isNavigating],
  );

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await apiService.logout();
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });

      router.push("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  // Toggle menu
  const toggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  return (
    <>
      {/* Overlay */}
      {showMenu && (
        <div
          className={styles.menuOverlay}
          onClick={toggleMenu}
          role="presentation"
          aria-label="Cerrar menú"
        />
      )}

      {/* Expanded Menu */}
      <div
        className={`${styles.expandedMenu} ${showMenu ? styles.expandedMenuOpen : ""}`}
        role="menu"
        aria-label="Menú de usuario"
        aria-hidden={!showMenu}
      >
        <div className={styles.expandedMenuContent}>
          {/* Drag handle */}
          <div className={styles.menuHandle} aria-hidden="true" />

          {/* User Profile */}
          <div className={styles.userSection}>
            <div className={styles.userAvatar} aria-label="Avatar de usuario">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name || "Usuario"} />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name || "Usuario"}</div>
              <div className={styles.userEmail}>
                {user?.email || "email@example.com"}
              </div>
            </div>
          </div>

          {/* Acciones de usuario */}
          <div className={styles.actions}>
            <button
              onClick={() => {
                setShowSettings(true);
                setShowMenu(false);
              }}
              className={styles.actionButton}
            >
              <Settings size={20} />
              <span>Configuración</span>
            </button>
            <button onClick={handleLogout} className={styles.actionButton}>
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - SOLO ÍCONOS en ROW */}
      <nav
        className={styles.navbar}
        role="navigation"
        aria-label="Navegación principal"
      >
        {navItems.map((item) => {
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
                  <span
                    className={styles.badge}
                    aria-label={`${item.badge} notificaciones`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              {/* SIN TEXTO - solo íconos */}
            </button>
          );
        })}

        {/* Botón de Perfil/Menú */}
        <button
          onClick={toggleMenu}
          className={`
            ${styles.navItem}
            ${showMenu ? styles.navItemActive : ""}
          `}
          aria-label={showMenu ? "Cerrar menú" : "Abrir menú de usuario"}
          aria-expanded={showMenu}
        >
          <div className={styles.navItemIconWrapper}>
            <User size={24} className={styles.navItemIcon} />
          </div>
          {/* SIN TEXTO */}
        </button>
      </nav>

      {/* Loading Indicator */}
      {isNavigating && (
        <div
          className={styles.loadingIndicator}
          role="status"
          aria-label="Cargando"
        >
          <div className={styles.loadingSpinner} />
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

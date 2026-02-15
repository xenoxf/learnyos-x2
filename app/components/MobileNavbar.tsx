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
  Menu,
  X,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { SettingsModal } from "@/components/SettingsModal";
import styles from "@/styles/mobileNavbar.module.css";
import { useAuth } from "@/hooks/useAuthMutation";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

// Todos estos ítems se muestran en la barra inferior
const navItems: MenuItem[] = [
  { title: "Inicio", url: "/study", icon: LayoutDashboard },
  { title: "Chat", url: "/study/chat", icon: MessageSquare, badge: 3 },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
  { title: "Traductor", url: "/study/translator", icon: Languages },
];

export function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const user = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Cerrar drawer al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleNavigation = useCallback(
    (url: string) => {
      if (pathname === url) return;
      setIsNavigating(true);
      setShowMenu(false);
      router.push(url);
      // Resetear el flag después de la navegación (podrías escuchar el evento de carga)
      setTimeout(() => setIsNavigating(false), 300);
    },
    [pathname, router],
  );

  const handleLogout = useCallback(async () => {
    try {
      await apiService.logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push("/login");
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  return (
    <>
      {/* Barra de navegación inferior */}
      <nav className={styles.bottomNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;
          return (
            <button
              key={item.url}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              onClick={() => handleNavigation(item.url)}
              aria-label={item.title}
            >
              <div className={styles.navIconWrapper}>
                <Icon size={20} />
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </div>
              <span className={styles.navLabel}>{item.title}</span>
            </button>
          );
        })}
        {/* Botón para abrir el menú lateral */}
        <button
          className={styles.menuButton}
          onClick={() => setShowMenu(true)}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
          <span className={styles.navLabel}>Menú</span>
        </button>
      </nav>

      {/* Overlay y drawer lateral */}
      {showMenu && (
        <div className={styles.drawerOverlay}>
          <div ref={drawerRef} className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Menú</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowMenu(false)}
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.drawerContent}>
              <button
                className={styles.drawerItem}
                onClick={() => {
                  setShowMenu(false);
                  // Aquí podrías navegar a una página de perfil si existe
                  toast({
                    title: "Perfil",
                    description: "Funcionalidad en desarrollo",
                  });
                }}
              >
                <User size={18} />
                <span>Perfil</span>
              </button>
              <button
                className={styles.drawerItem}
                onClick={() => {
                  setShowMenu(false);
                  setShowSettings(true);
                }}
              >
                <Settings size={18} />
                <span>Configuración</span>
              </button>
              <button className={styles.drawerItem} onClick={handleLogout}>
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { GuestBanner } from "@/components/GuestBanner";
import { apiService } from "@/services/apiService";
import { Loader2 } from "lucide-react";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Función para verificar estado de autenticación
  const checkAuthStatus = useCallback(() => {
    if (typeof window === "undefined") return;

    // Verificar si es invitado
    const guestStatus = apiService.isGuest();
    setIsGuest(guestStatus);

    // Verificar token
    const token = localStorage.getItem("token");
    if (token) {
      apiService.verifyToken().then((isValid) => {
        setIsTokenValid(isValid);
        setIsValidating(false);
      }).catch(() => {
        setIsTokenValid(false);
        setIsValidating(false);
        // Limpiar token inválido y redirigir
        apiService.logout();
        router.push("/auth");
      });
    } else {
      setIsTokenValid(false);
      setIsValidating(false);
      // Sin token, redirigir a auth
      router.push("/auth");
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
    try {
      const savedState = localStorage.getItem("sidebar-collapsed");
      if (savedState !== null) {
        setIsCollapsed(savedState === "false");
      }

      // Verificar autenticación inicial
      checkAuthStatus();
    } catch (error) {
      console.error("Error in layout initialization:", error);
      setIsValidating(false);
      setIsTokenValid(false);
      router.push("/auth");
    }
  }, [checkAuthStatus, router]);

  // Escuchar cambios en localStorage para actualizar el banner
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isGuest" || e.key === "token") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed, mounted]);

  // Redirigir si el token no es válido
  useEffect(() => {
    if (!isValidating && !isTokenValid && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        // Token inválido, limpiar y redirigir
        apiService.logout();
      }
      router.push("/auth");
    }
  }, [isValidating, isTokenValid, router]);

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isValidating) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
          <p>Validando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
          <p>Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardLayout}>
      {isGuest && <GuestBanner />}
      
      {!isMobile && (
        <div
          className={`
            ${styles.sidebarWrapper}
            ${isCollapsed ? styles.sidebarWrapperCollapsed : styles.sidebarWrapperExpanded}
          `}
        >
          <AppSidebar collapsed={isCollapsed} onToggle={handleToggleSidebar} />
        </div>
      )}

      <div
        className={`
        ${styles.mainContent}
        ${!isMobile && isCollapsed ? styles.mainContentExpanded : ""}
        ${isMobile ? styles.mainContentMobile : ""}
        ${isGuest ? styles.mainContentWithBanner : ""}
      `}
      >
        <div className={styles.contentArea}>
          <div className={styles.contentWrapper}>{children}</div>
        </div>
      </div>

      {isMobile && <MobileNavbar />}
    </div>
  );
}

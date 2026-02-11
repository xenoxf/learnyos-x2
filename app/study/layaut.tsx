/*"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed, mounted]);

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMobileClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className={styles["container"]}>
        <header className={styles["header"]}>
          <AppSidebar />
        </header>

        <main className={styles["main"]}>{children}</main>
      </div>
    </>
  );
}

export default DashboardLayout;
*/

"use client";
import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { useAuth } from "@/hooks/useAuth";
import { useTokenVerification } from "@/hooks/useTokenVerification";
import { useRouter } from "next/navigation";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { isValid, isLoading } = useTokenVerification();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Redirigir si token es inválido o expirado
  useEffect(() => {
    if (!isLoading && !isValid) {
      router.push('/auth');
    }
  }, [isValid, isLoading, router]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Cargar estado del sidebar del localStorage
    try {
      const savedState = localStorage.getItem("sidebar-collapsed");
      if (savedState !== null) {
        setIsCollapsed(savedState === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed, mounted]);


  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMobileClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileOpen = () => {
    setMobileMenuOpen(true);
  };

  // Mostrar loading mientras se valida el token
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <p>Validando sesión...</p>
        </div>
      </div>
    );
  }

  // Si token es inválido, no renderizar nada (la redirección ocurre en useEffect)
  if (!isValid) {
    return null;
  }

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar para tablet y desktop */}
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

      {/* Contenido principal */}
      <div
        className={`
          ${styles.mainContent}
          ${!isMobile && isCollapsed ? styles.mainContentExpanded : ""}
          ${isMobile ? styles.mainContentMobile : ""}
        `}
      >
        <div className={styles.contentArea}>
          <div className={styles.contentWrapper}>{children}</div>
        </div>
      </div>

      {/* Navbar móvil (bottom navigation) */}
      {isMobile && <MobileNavbar />}
    </div>
  );
}

export default DashboardLayout;

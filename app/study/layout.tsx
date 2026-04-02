"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { GuestBanner } from "@/components/GuestBanner";
import { apiService } from "@/services/apiService";
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

  useEffect(() => {
    setMounted(true);
    try {
      const savedState = localStorage.getItem("sidebar-collapsed");
      if (savedState !== null) {
        setIsCollapsed(savedState === "true");
      }
      // Verificar si es invitado
      setIsGuest(apiService.isGuest());
      
      // Verificar token
      const token = localStorage.getItem("token");
      if (token) {
        apiService.verifyToken().then((isValid) => {
          setIsTokenValid(isValid);
          setIsValidating(false);
        }).catch(() => {
          setIsTokenValid(false);
          setIsValidating(false);
        });
      } else {
        setIsTokenValid(false);
        setIsValidating(false);
      }
    } catch {
      setIsValidating(false);
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

  if (isValidating) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <p>Validando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return null;
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

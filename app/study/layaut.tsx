"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/apiService";
import styles from "@/styles/layout.module.css";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);

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

  if (!isTokenValid) {
    return null;
  }

  return (
    <div className={styles.dashboardLayout}>
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

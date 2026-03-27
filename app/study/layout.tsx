"use client";

import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
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
      // noop
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    } catch {
      // noop
    }
  }, [isCollapsed, mounted]);

  return (
    <div className={styles.dashboardLayout}>
      {!isMobile && (
        <div
          className={`${styles.sidebarWrapper} ${isCollapsed ? styles.sidebarWrapperCollapsed : styles.sidebarWrapperExpanded}`}
        >
          <AppSidebar
            collapsed={isCollapsed}
            onToggle={() => setIsCollapsed((prev) => !prev)}
          />
        </div>
      )}

      <div
        className={`${styles.mainContent} ${!isMobile && isCollapsed ? styles.mainContentExpanded : ""} ${isMobile ? styles.mainContentMobile : ""}`}
      >
        <div className={styles.contentArea}>
          <div className={styles.contentWrapper}>{children}</div>
        </div>
      </div>

      {isMobile && <MobileNavbar />}
    </div>
  );
}

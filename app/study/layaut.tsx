"use client";

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

  /*return (
    <div className={layoutStyles.dashboardLayout}>
      <div
        className={`
          ${layoutStyles.desktopSidebarWrapper}
          ${isCollapsed ? layoutStyles.desktopSidebarWrapperCollapsed : layoutStyles.desktopSidebarWrapperExpanded}
        `}
      >
        <AppSidebar
          collapsed={isCollapsed}
          onToggle={handleToggleSidebar}
        />
      </div>

      {isMobileMenuOpen && (
        <div
          className={layoutStyles.mobileOverlay}
          onClick={handleMobileClose}
          role="presentation"
        />
      )}

      <div
        className={`
          ${layoutStyles.mobileSidebarWrapper}
          ${!isMobileMenuOpen ? layoutStyles.mobileSidebarWrapperClosed : ''}
        `}
      >
        <AppSidebar
          collapsed={false}
          onToggle={handleMobileClose}
        />
      </div>

      <div className={layoutStyles.mainContent}>
        <div className={layoutStyles.contentArea}>
          <div className={layoutStyles.contentWrapper}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );*/
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

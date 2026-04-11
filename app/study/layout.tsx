"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavbarRight } from "@/components/MobileNavbarRight";
import { MobileNavbarV4 } from "@/components/MobileNavbarV4";
import { GuestBanner } from "@/components/GuestBanner";
import { apiService } from "@/services/apiService";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; picture?: string } | null>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load sidebar state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) setIsCollapsed(saved === "false");
    } catch { }
  }, []);

  // Auth validation - NO loading screen, validate silently in background
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // No token - redirect to auth
    if (!token) {
      setIsTokenValid(false);
      return;
    }

    // User has token - show content immediately, validate in background
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        const guestStatus = parsed?.isGuest === true;
        setIsGuest(guestStatus);

        // If guest, skip token verification (guests can browse public content)
        if (guestStatus) {
          setIsTokenValid(true);
          return;
        }
      } catch {
        setIsGuest(false);
      }
    }

    // Validate token silently for non-guest users
    apiService.verifyToken().then((isValid) => {
      if (!isValid) {
        setIsTokenValid(false);
      }
    }).catch(() => {
      // Network error - assume token is valid
    });
  }, []);

  // Redirect only if no token at all
  useEffect(() => {
    if (!isTokenValid && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth");
      }
    }
  }, [isTokenValid, router]);

  // Sync guest status across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        const newToken = localStorage.getItem("token");
        const newUser = localStorage.getItem("user");
        if (!newToken || !newUser) {
          router.push("/auth");
        } else {
          try {
            const parsed = JSON.parse(newUser);
            setUser(parsed);
            setIsGuest(parsed?.isGuest === true);
            setIsTokenValid(true);
          } catch { }
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [router]);

  // Save sidebar state
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    } catch { }
  }, [isCollapsed]);

  const handleToggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const guestBanner = useMemo(() => isGuest ? <GuestBanner /> : null, [isGuest]);

  // No loading screen - render content immediately
  if (!isTokenValid) {
    return null;
  }

  return (
    <div className={styles.dashboardLayout}>
      {guestBanner}

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

      {/* Mobile navbars */}
      {isMobile && (
        <>
          <MobileNavbarRight />
        </>
      )}
    </div>
  );
}

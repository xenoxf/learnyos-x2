"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavbarRight } from "@/components/MobileNavbarRight";
import { MobileNavbarV4 } from "@/components/MobileNavbarV4";
import { GuestBanner } from "@/components/GuestBanner";
import { apiService } from "@/services/apiService";
import { Loader2 } from "lucide-react";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
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
    } catch {}
  }, []);

  // Auth validation
  const validateAuth = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      setIsValidating(false);
      setIsTokenValid(false);
      return;
    }

    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        setIsGuest(parsed?.isGuest === true);
      } catch {
        setIsGuest(false);
      }
    }

    try {
      const isValid = await apiService.verifyToken();
      if (isValid) {
        setIsTokenValid(true);
      } else {
        apiService.logout();
        setIsTokenValid(false);
        setIsGuest(false);
        setUser(null);
      }
    } catch {
      setIsTokenValid(true);
    }

    setIsValidating(false);
  }, []);

  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  // Redirect if no token
  useEffect(() => {
    if (!isValidating && !isTokenValid && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth");
      }
    }
  }, [isValidating, isTokenValid, router]);

  // Sync guest status
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
          } catch {}
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
    } catch {}
  }, [isCollapsed]);

  const handleToggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const guestBanner = useMemo(() => isGuest ? <GuestBanner /> : null, [isGuest]);

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
          <MobileNavbarV4 />
          <MobileNavbarRight />
        </>
      )}
    </div>
  );
}

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/layout.module.css";
import { authService } from "@/services/authService";

// Lazy load heavy components
const AppSidebar = lazy(() =>
  import("@/components/AppSidebar").then((m) => ({ default: m.AppSidebar })),
);
const MobileNavbarRight = lazy(() =>
  import("@/components/MobileNavbarRight").then((m) => ({
    default: m.MobileNavbarRight,
  })),
);
const MobileNavbarV4 = lazy(() =>
  import("@/components/MobileNavbarV4").then((m) => ({
    default: m.MobileNavbarV4,
  })),
);
const GuestBanner = lazy(() =>
  import("@/components/GuestBanner").then((m) => ({ default: m.GuestBanner })),
);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [hasToken, setHasToken] = useState(true);
  const validatedRef = useRef(false);

  // Detect mobile - only on mount and resize
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) setIsCollapsed(saved === "true");
    } catch {
      /* ignore */
    }
  }, []);

  // Save sidebar state
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    } catch {
      /* ignore */
    }
  }, [isCollapsed]);

  // Auth check - synchronous, no API call on layout load
  useEffect(() => {
    if (validatedRef.current) return;
    validatedRef.current = true;

    const token = localStorage.getItem("token");
    if (!token) {
      setHasToken(false);
      router.push("/auth");
      return;
    }

    // Check guest status from localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setIsGuest(parsed?.isGuest === true);
      }
    } catch {
      /* ignore */
    }

    // Validate token in background (don't block render)
    authService
      .verifyToken()
      .then(async (isValid) => {
        if (!isValid) {
          // Token invalid — try to refresh before redirecting
          router.push("/auth");
        }
      })
      .catch(() => {
        // Network error - assume valid, don't force logout
      });
  }, [router]);

  const handleToggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        const newToken = localStorage.getItem("token");
        if (!newToken) {
          router.push("/auth");
        } else {
          try {
            const parsed = JSON.parse(localStorage.getItem("user") || "{}");
            setIsGuest(parsed?.isGuest === true);
          } catch {
            /* ignore */
          }
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [router]);

  if (!hasToken) return null;

  return (
    <div className={styles.dashboardLayout}>
      {!isMobile && (
        <div
          className={`${styles.sidebarWrapper} ${isCollapsed ? styles.sidebarWrapperCollapsed : styles.sidebarWrapperExpanded}`}
        >
          <Suspense fallback={<div className={styles.sidebarSkeleton} />}>
            <AppSidebar
              collapsed={isCollapsed}
              onToggle={handleToggleSidebar}
            />
          </Suspense>
        </div>
      )}

      <div
        className={`${styles.mainContent} ${isMobile ? styles.mainContentMobile : ""}`}
      >
        <Suspense fallback={null}>{isGuest && <GuestBanner />}</Suspense>
        <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
          {children}
        </Suspense>
      </div>

      {isMobile && (
        <Suspense fallback={null}>
          <MobileNavbarRight />
        </Suspense>
      )}
    </div>
  );
}

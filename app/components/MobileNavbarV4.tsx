"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Book, MessageSquare, Brain, CreditCard, NotebookPen, Settings2, LogOut, Home } from "lucide-react";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/useLocalToast";
import { ThemeToggleSidebr } from "./ThemeToogleSidebr";
import styles from "@/styles/mobileNavbarV4.module.css";
import Link from "next/link";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { title: "Klerk", url: "/study", icon: Home },
  { title: "Chat", url: "/study/chat", icon: MessageSquare },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
];

export function MobileNavbarV4() {
  const router = useRouter();
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  const isActive = useCallback(
    (url: string) => url === "/study" ? pathname === url : pathname?.startsWith(url + "/"),
    [pathname],
  );

  const handleLogout = useCallback(async () => {
    try {
      await apiService.logout();
      toast.success("Sesión cerrada", "Has cerrado sesión correctamente");
      router.push("/auth");
    } catch {
      toast.error("Error", "No se pudo cerrar la sesión");
    }
  }, [router]);

  // Handle scroll to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollYRef.current && currentScrollY > 60) {
            setIsHidden(true);
          } else {
            setIsHidden(false);
          }
          lastScrollYRef.current = currentScrollY;
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${isHidden ? styles.navbarHidden : ""}`}>
      <div className={styles.navbarInner}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          return (
            <Link
              key={item.url}
              href={item.url}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
            >
              <Icon size={22} />
              <span>{item.title}</span>
            </Link>
          );
        })}
        <Link href="/study/espacio/general" className={styles.navItem}>
          <Settings2 size={22} />
          <span>Espacio</span>
        </Link>
      </div>
    </nav>
  );
}

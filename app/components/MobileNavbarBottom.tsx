"use client";

import React, { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Book, MessageSquare, Brain, CreditCard, NotebookPen, Plus } from "lucide-react";
import Link from "next/link";
import styles from "@/styles/mobileNavbarBottom.module.css";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  accent?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { title: "Klerk", url: "/study", icon: Book },
  { title: "Chat", url: "/study/chat", icon: MessageSquare },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Notas", url: "/study/notes", icon: NotebookPen },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
];

export function MobileNavbarBottom() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = useCallback(
    (url: string) => url === "/study" ? pathname === url : pathname?.startsWith(url + "/"),
    [pathname],
  );

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarInner}>
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          const isCenter = index === 2; // Quiz in center

          if (isCenter) {
            return (
              <Link
                key={item.url}
                href={item.url}
                className={`${styles.navItem} ${styles.navItemCenter} ${active ? styles.navItemActive : ""}`}
              >
                <div className={styles.centerIconWrapper}>
                  <Icon size={22} />
                </div>
                <span className={styles.navLabel}>{item.title}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.url}
              href={item.url}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
            >
              <div className={styles.iconWrapper}>
                <Icon size={20} />
              </div>
              <span className={styles.navLabel}>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

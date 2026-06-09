"use client";

import { useCallback } from "react";
import type { ElementType } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Brain,
  CreditCard,
  Settings2,
  Home,
} from "lucide-react";
import styles from "@/styles/mobileNavbarV4.module.css";
import Link from "next/link";

interface NavItem {
  title: string;
  url: string;
  icon: ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { title: "Klerk", url: "/study", icon: Home },
  { title: "Chat", url: "/study/chat", icon: MessageSquare },
  { title: "Quiz", url: "/study/quiz", icon: Brain },
  { title: "Flashcards", url: "/study/flashcards", icon: CreditCard },
];

export function MobileNavbarV4() {
  const pathname = usePathname();

  const isActive = useCallback(
    (url: string) =>
      url === "/study" ? pathname === url : pathname?.startsWith(url + "/"),
    [pathname],
  );

  return (
    <div className={styles.navbar}>
      <nav className={styles.navbarInner}>
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
        <Link href="/study/espacio" className={styles.navItem}>
          <Settings2 size={22} />
          <span>Espacio</span>
        </Link>
      </nav>

    </div>
  );
}

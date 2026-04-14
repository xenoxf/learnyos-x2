import React from "react";
import Image from "next/image";
import styles from "@/styles/header.module.css";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

export default function Header() {
  const user =
    typeof window !== "undefined"
      ? localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!)
        : null
      : null;

  return (
    <>
      {/* Header - not fixed on mobile */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerBrand}>
            <div className={styles.brandIcon}>
              <Image
                src="/logo-100x100.png"
                alt="LearnYos Logo"
                width={100}
                height={100}
                className={styles.brandIconImage}
              />
            </div>
            <div className={styles.brandInfo}>
              <span className={styles.brandName}>LearnYos</span>
              <div className={styles.brandSubtitle}>Powered by AI</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            {/*<LandingThemeSelector />*/}
            <ThemeToggle />
            {/*<Link href="/auth" className={styles.headerSignIn}>
              Iniciar Sesión
            </Link>*/}
            <Link className={styles.headerButton} href="/auth">
              <span className={styles.headerButtonSmallText}>Comenzar</span>
              <Button className={styles.headerButtonLargeText}>
                Comenzar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

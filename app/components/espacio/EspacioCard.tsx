import React from "react";
import { LucideIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./EspacioCard.module.css";

interface EspacioCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "gradient";
  colorScheme?: string; // e.g., "yellow", "green", "purple"
  className?: string;
  children?: React.ReactNode;
}

export const EspacioCard: React.FC<EspacioCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  variant = "primary",
  colorScheme,
  className = "",
  children,
}) => {
  const CardContent = (
    <>
      <div className={`${styles.iconWrapper} ${colorScheme ? styles[colorScheme] : ""}`}>
        <Icon size={24} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
        {children}
      </div>
      {(href || onClick) && (
        <div className={styles.arrow}>
          <ArrowRight size={18} />
        </div>
      )}
    </>
  );

  const combinedClassName = `${styles.card} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {CardContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={combinedClassName}
      disabled={!onClick}
    >
      {CardContent}
    </button>
  );
};

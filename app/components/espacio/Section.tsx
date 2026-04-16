import React from "react";
import styles from "./Section.module.css";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, className = "" }) => {
  return (
    <section className={`${styles.section} ${className}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.content}>{children}</div>
    </section>
  );
};

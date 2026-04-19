"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Coins,
  FileText,
  CreditCard,
  Brain,
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Palette,
} from "lucide-react";
import styles from "@/styles/espacio/espacioLayout.module.css";
import Sidebar from "@/components/espacio/Sidebar";

export default function EspacioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.espacioContainer}>
      <Sidebar />

      {/* Desktop collapse toggle */}

      <main className={styles.espacioMain}>{children}</main>
    </div>
  );
}

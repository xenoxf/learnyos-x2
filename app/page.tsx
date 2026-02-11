"use client";

import React from "react";
import { LandingPage } from "@/components/LandingPage";
import { HeaderThemeSelector } from "@/components/HeaderThemeSelector";
import type { Metadata } from 'next';

export default function Home() {
  return (
    <>
      {/* Header */}
      <LandingPage />
    </>
  );
}

import type { Metadata } from "next";
import { LandingClient } from "@/components/LandingClient";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://learnyos.xenooxf.me";

export const metadata: Metadata = {
  title:
    "LearnYos | Plataforma de Estudio con IA — Exámenes, Flashcards y Tutor Inteligente",
  description:
    "LearnYos es la plataforma de aprendizaje activo potenciada por inteligencia artificial. Crea exámenes online, flashcards compartidas y estudia con Junior IA, tu tutor personal 24/7.",
  keywords: [
    "plataforma de estudio con IA",
    "exámenes online gratuitos",
    "flashcards compartidas",
    "tutor inteligente",
    "aprendizaje colaborativo",
    "Junior IA",
    "crear exámenes",
    "flashcards educativas",
    "quiz online",
    "estudio interactivo",
  ],
  openGraph: {
    title: "LearnYos — Aprende con Inteligencia Artificial",
    description:
      "Crea exámenes, flashcards y estudia con Junior IA. Plataforma gratuita de aprendizaje activo.",
    url: appUrl,
    type: "website",
  },
  alternates: {
    canonical: appUrl,
  },
};

export default function HomePage() {
  return (
    <>
      <LandingClient />
    </>
  );
}

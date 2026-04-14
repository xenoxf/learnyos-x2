import { Providers } from "./providers";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LocalToaster } from "./components/LocalToaster";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffe6eb" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://learnyos.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),

  title: {
    default: "LearnYos",
    template: "%s | LearnYos",
  },

  description:
    "La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas para maximizar tu aprendizaje.",

  keywords: [
    "educación",
    "IA",
    "estudio",
    "flashcards",
    "quiz",
    "notas",
    "pomodoro",
    "spaced repetition",
    "active recall",
    "mejor app de estudio",
    "crear exámenes online",
    "flashcards inteligentes",
    "preparar ICFES",
    "estudiar para examen",
    "notas digitales",
    "plataforma educativa",
    "estudiar gratis",
    "generar exámenes con IA",
    "quiz interactivo",
    "aprendizaje inteligente",
    "herramientas de estudio",
    "tarjetas de memoria",
    "examen en línea",
    "educación virtual",
    "study app",
    "educational AI",
    "aprender online",
    "técnica de estudio",
    "repaso espaciado",
    "memorización activa",
    "preparar pruebas",
    "examen tipo ICFES",
    "quiz educativo",
    "tarjetas de estudio",
    "apuntes digitales",
    "asistente de estudio IA",
    "generador de quizzes",
    "creador de flashcards",
    "estudio con inteligencia artificial",
    "plataforma de aprendizaje",
    "educación en línea Colombia",
    "mejorar rendimiento académico",
    "técnicas de memorización",
    "app educativa gratuita",
    "estudiar desde casa",
    "preparación académica",
    "herramientas educativas digitales",
    "inteligencia artificial educativa",
    "LearnYos",
    "klerk",
    "junior IA",
  ],

  authors: [{ name: "Jesus Camacho" }],
  creator: "Jesus Camacho",
  publisher: "Jesus Camacho",

  // ✅ CORREGIDO
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    title: "LearnYos",
    description:
      "La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas para maximizar tu aprendizaje",
    siteName: "LearnYos",
    images: [
      {
        url: "/hero-study.png",
        width: 1200,
        height: 630,
        alt: "LearnYos - Plataforma de estudio con IA",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "LearnYos",
    description:
      "La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas para maximizar tu aprendizaje",
    images: ["/twitter-image.png"],
    creator: "@learnyos",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/logo-100x100.png",
    shortcut: "/logo-100x100.png",
    apple: "/logo-100x100.png",
  },

  manifest: "/manifest.json",

  alternates: {
    canonical: "/",
  },

  // 🔥 ESTO ES LO QUE NECESITAS PARA GOOGLE SEARCH CONSOLE
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

// 🔥 Structured Data (SEO PRO)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LearnYos",
  description:
    "La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas para maximizar tu aprendizaje",
  url: appUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={appUrl} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* CSS crítico inline - evita FOUC */}
        <style dangerouslySetInnerHTML={{
          __html: `
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
            body {
              background-color: hsl(0 0% 100%);
              color: hsl(0 0% 3.9%);
              font-family: Arial, Helvetica, sans-serif;
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              min-height: 100vh;
              overflow-x: hidden;
            }
            .dark body {
              background-color: hsl(0 0% 3.9%);
              color: hsl(0 0% 98%);
            }
            img { max-width: 100%; height: auto; display: block; }
            a { color: inherit; text-decoration: none; }
            button { cursor: pointer; font-family: inherit; }
            
            /* Auth page critical CSS - prevents FOUC */
            .authPage { width: 100%; height: 100dvh; height: 100vh; display: flex; justify-content: center; align-items: center; flex-direction: column; background-color: hsl(var(--background, 0 0% 100%)); color: hsl(var(--foreground, 0 0% 3.9%)); }
            .auth { width: 100%; max-width: 460px; display: flex; justify-content: center; align-items: center; flex-direction: column; }
            .containerTitle { width: 100%; margin-bottom: 1.5rem; text-align: center; }
            .appTitle { font-size: 1.875rem; font-weight: 900; color: hsl(var(--foreground, 0 0% 3.9%)); margin: 0.5rem 0 0 0; }
            .authWindow { width: 100%; background-color: hsl(var(--card, 0 0% 100%)); color: hsl(var(--card-foreground, 0 0% 3.9%)); border: 1px solid hsl(var(--border, 0 0% 89.8%)); border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
            .cardTitle { font-size: 1.5rem; font-weight: 700; color: hsl(var(--foreground, 0 0% 3.9%)); }
            .cardContent { display: flex; flex-direction: column; gap: 1.5rem; }
            .authBtnVolver { background-color: hsl(var(--primary, 0 0% 9%)); color: hsl(var(--primary-foreground, 0 0% 98%)); position: absolute; top: 1rem; left: 1rem; width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; z-index: 10; }
            .divider { display: flex; align-items: center; gap: 1rem; }
            .dividerLine { flex: 1; height: 1px; background: hsl(var(--border, 0 0% 89.8%)); }
            .dividerText { font-size: 0.875rem; color: hsl(var(--muted-foreground, 0 0% 45.1%)); white-space: nowrap; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `
        }} />

        {/* 🔥 SEO estructurado */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
          strategy="afterInteractive"
        />
      </head>

      <body className="body">
        <Providers>{children}</Providers>
        <LocalToaster position="top-right" />
      </body>
    </html>
  );
}

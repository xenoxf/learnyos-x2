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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
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

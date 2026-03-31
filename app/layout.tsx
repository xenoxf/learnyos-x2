import { Providers } from "./providers";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learnyos.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "LearnYos - Aprende más rápido con IA",
    template: "%s | LearnYos",
  },
  description:
    "La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas para maximizar tu aprendizaje. Chatbot IA, generador de quiz, flashcards inteligentes y notas estructuradas.",
  keywords: [
    "educación",
    "IA",
    "inteligencia artificial",
    "estudio",
    "aprendizaje",
    "flashcards",
    "quiz",
    "notas",
    "chatbot educativo",
    "técnica pomodoro",
    "spaced repetition",
    "active recall",
    "plataforma educativa",
    "e-learning",
    "colombia educación",
  ],
  authors: [{ name: "LearnYos Team" }],
  creator: "LearnYos",
  publisher: "LearnYos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    title: "LearnYos - Aprende más rápido con IA",
    description:
      "La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas.",
    siteName: "LearnYos",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LearnYos - Plataforma de estudio con IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnYos - Aprende más rápido con IA",
    description:
      "La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas.",
    images: ["/twitter-image.png"],
    creator: "@learnyos",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

// Structured data para SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LearnYos",
  description: "Plataforma de estudio con IA para aprendizaje acelerado",
  url: appUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1000",
  },
  featureList: [
    "Chatbot IA educativo",
    "Generador de quizzes",
    "Flashcards inteligentes",
    "Notas automáticas",
    "Técnica Pomodoro",
    "Spaced repetition",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="canonical" href={appUrl} />
        {/* Structured Data para SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          strategy="afterInteractive"
        />
      </head>
      <body className="body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

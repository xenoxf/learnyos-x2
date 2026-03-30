import { Providers } from "./providers";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import type { Metadata, Viewport } from "next";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://learnyos.com"),
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
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnYos - Aprende más rápido con IA",
    description:
      "La plataforma de estudio más avanzada que combina inteligencia artificial y metodologías probadas.",
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
      </head>
      <body className="body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

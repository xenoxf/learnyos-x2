import { Providers } from "./providers";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LocalToaster } from "./components/LocalToaster";
import { PWALoader } from "./components/PWALoader";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://learnyos.vercel.app"),
  title: {
    default: "LearnYos | Plataforma de Aprendizaje con IA",
    template: "%s | LearnYos",
  },
  description: "Domina cualquier tema con LearnYos. La plataforma de estudio avanzada con IA, Spaced Repetition y Active Recall.",
  keywords: ["LearnYos", "IA educativa", "estudio inteligente", "active recall", "spaced repetition"],
  authors: [{ name: "Jesus Camacho" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    title: "LearnYos | Potencia tu Aprendizaje",
    description: "Crea exámenes, flashcards y notas inteligentes con IA.",
    siteName: "LearnYos",
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
        <PWALoader />
        <Providers>{children}</Providers>
        <LocalToaster position="top-right" />
      </body>
    </html>
  );
}

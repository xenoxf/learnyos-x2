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

        {/* CSS crítico inline - evita FOUC y parpadeo de carga */}
        <style dangerouslySetInnerHTML={{
          __html: `
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
            body { background-color: #09090b; color: white; font-family: sans-serif; min-height: 100vh; }
            #pwa-loader-static { position: fixed; inset: 0; z-index: 999999; background-color: #09090b; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 2rem; }
            .loader-content { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
            .loader-title { font-size: 3rem; font-weight: 950; }
            .loader-quote { font-size: 1.125rem; opacity: 0.8; }
            @keyframes fadeOut { to { opacity: 0; visibility: hidden; } }
          `
        }} />

        <Script
          id="remove-loader"
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('load', () => { const el = document.getElementById('pwa-loader-static'); if(el) el.style.animation = 'fadeOut 0.5s ease forwards'; });`
          }}
          strategy="afterInteractive"
        />

        {/* CSS crítico antiguo... */}

      <body className="body">
        <div id="pwa-loader-static">
          <div className="loader-content">
            <h1 className="loader-title">LearnYos</h1>
            <p className="loader-quote">"Solo pierdes cuando dejas de intentarlo"</p>
          </div>
        </div>
        <Providers>{children}</Providers>
        <LocalToaster position="top-right" />
      </body>
    </html>
  );
}

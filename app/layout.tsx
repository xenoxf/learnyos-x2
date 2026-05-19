import { Providers } from "./providers";
import "./globals.css";
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
const isDev = process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://learnyos.vercel.app"
  ),
  title: {
    default:
      "LearnYos | Plataforma de Estudio con IA — Exámenes, Flashcards y Tutor Inteligente",
    template: "%s | LearnYos",
  },
  description:
    "LearnYos es la plataforma de aprendizaje activo potenciada por inteligencia artificial. Crea exámenes online, flashcards compartidas y estudia con Junior IA, tu tutor personal 24/7. Aprende más rápido con estudio colaborativo.",
  keywords: [
    "plataforma de estudio con IA",
    "exámenes online gratuitos",
    "flashcards compartidas",
    "tutor inteligente artificial",
    "aprendizaje colaborativo",
    "estudio interactivo",
    "evaluación de conocimientos",
    "Junior IA tutor",
    "crear exámenes online",
    "flashcards educativas",
    "LearnYos",
    "estudio con inteligencia artificial",
    "plataforma educativa",
    "quiz online",
    "aprendizaje activo",
  ],
  authors: [{ name: "Jesus Camacho", url: appUrl }],
  creator: "Jesus Camacho",
  publisher: "LearnYos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    title: "LearnYos — Plataforma de Estudio con IA",
    description:
      "Crea exámenes, flashcards y estudia con inteligencia artificial. Tu tutor personal Junior IA disponible 24/7.",
    siteName: "LearnYos",
    url: appUrl,
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "LearnYos — Plataforma de Estudio con IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnYos — Plataforma de Estudio con IA",
    description:
      "Crea exámenes, flashcards y estudia con inteligencia artificial. Tu tutor personal Junior IA disponible 24/7.",
    images: [`${appUrl}/og-image.png`],
    creator: "@learnyos",
    site: "@learnyos",
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
  alternates: {
    canonical: isDev ? undefined : appUrl,
    languages: {
      es: `${appUrl}/`,
      en: `${appUrl}/en/`,
    },
  },
  category: "education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LearnYos",
    url: appUrl,
    logo: `${appUrl}/logo-100x100.png`,
    description:
      "Plataforma de aprendizaje activo potenciada por inteligencia artificial especializada en exámenes, flashcards y tutoría inteligente.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Spanish", "English"],
    },
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LearnYos",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "Plataforma de estudio con inteligencia artificial que permite crear exámenes online, flashcards compartidas y estudiar con un tutor IA personal llamado Junior.",
    url: appUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "120",
    },
    screenshot: `${appUrl}/landing/hero-study.png`,
    featureList: [
      "Exámenes online interactivos",
      "Flashcards compartidas por la comunidad",
      "Tutor IA Junior disponible 24/7",
      "Notas de estudio generadas por IA",
      "Seguimiento de progreso y estadísticas",
      "Aprendizaje colaborativo",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué es LearnYos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "LearnYos es una plataforma de aprendizaje activo potenciada por inteligencia artificial donde puedes crear exámenes online, flashcards compartidas y estudiar con Junior IA, tu tutor personal disponible 24/7.",
        },
      },
      {
        "@type": "Question",
        name: "¿LearnYos es gratuito?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, LearnYos ofrece un plan gratuito con créditos diarios renovables que te permiten generar quizzes, flashcards, notas y chatear con el tutor IA. También puedes usar la plataforma como invitado sin registrarte.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué es Junior IA?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Junior IA es el tutor inteligente de LearnYos, un asistente de estudio basado en inteligencia artificial disponible 24/7 que puede explicarte conceptos complejos, resolver dudas y ayudarte a entender cualquier tema de forma personalizada.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo crear mis propios exámenes y flashcards?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, en LearnYos puedes crear tus propios exámenes online y flashcards, compartirlos con la comunidad o mantenerlos privados. También puedes generar contenido automáticamente con inteligencia artificial.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo funciona el sistema de créditos diarios?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "LearnYos utiliza un sistema de créditos diarios gratuitos que se renuevan cada medianoche. Cada acción como generar un quiz, crear flashcards o chatear con Junior IA consume créditos. Los créditos no usados no se acumulan, pero se renuevan completamente cada día.",
        },
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LearnYos",
    description:
      "Plataforma de evaluación de conocimientos basada en comunidad e inteligencia artificial, especializada en exámenes y flashcards.",
    url: appUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: appUrl,
      },
    ],
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="LearnYos" />

        <style
          dangerouslySetInnerHTML={{
            __html: `
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
            body {
              background-color: hsl(0 0% 100%);
              color: hsl(0 0% 3.9%);
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            .skip-link {
              position: absolute;
              top: -9999px;
              left: 50%;
              transform: translateX(-50%);
              background: hsl(0 0% 9%);
              color: hsl(0 0% 98%);
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              z-index: 99999;
              text-decoration: none;
              font-weight: 600;
              font-size: 1rem;
            }
            .skip-link:focus {
              top: 1rem;
            }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `,
          }}
        />

        {!isDev && (
          <>
            <Script
              id="organization-schema"
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(organizationSchema),
              }}
              strategy="afterInteractive"
            />
            <Script
              id="software-app-schema"
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(softwareAppSchema),
              }}
              strategy="afterInteractive"
            />
            <Script
              id="faq-schema"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
              strategy="afterInteractive"
            />
            <Script
              id="web-app-schema"
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(webAppSchema),
              }}
              strategy="afterInteractive"
            />
            <Script
              id="breadcrumb-schema"
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(breadcrumbSchema),
              }}
              strategy="afterInteractive"
            />
          </>
        )}
      </head>

      <body className="body" cz-shortcut-listen="true">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <Providers>{children}</Providers>
        <LocalToaster position="top-right" />
      </body>
    </html>
  );
}

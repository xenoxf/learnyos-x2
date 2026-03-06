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
};

export const metadata: Metadata = {
  title: "LearnYos - Educación Inteligente",
  description: "Aprende con IA generativa. Exámenes, notas, flashcards y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // En el componente principal, usar el hook

  return (
    <html lang="es" suppressHydrationWarning>
      <head></head>
      <body className="body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

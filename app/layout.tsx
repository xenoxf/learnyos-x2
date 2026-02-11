import { Providers } from "./providers";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { useTokenVerification } from '@/hooks/useTokenVerification';

export const metadata = {
  title: "LearnYos - Educación Inteligente",
  description: "Aprende con IA generativa. Exámenes, notas, flashcards y más.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // En el componente principal, usar el hook
  useTokenVerification();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'theme-sakura';
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

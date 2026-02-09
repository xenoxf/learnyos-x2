import { Providers } from "./providers";
import "./globals.css";

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

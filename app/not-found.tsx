import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada — LearnYos',
  description: 'La página que buscas no existe o fue movida. Vuelve al inicio de LearnYos para continuar estudiando.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="not-found-wrapper">
      <div className="not-found-inner">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-heading">Página no encontrada</h2>
        <p className="not-found-text">
          La página que buscas no existe, fue movida o no está disponible.
          Volvé al inicio para seguir estudiando.
        </p>
        <Link href="/" className="not-found-btn">
          ← Volver al inicio
        </Link>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .not-found-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .not-found-inner {
          text-align: center;
          max-width: 500px;
        }
        .not-found-code {
          font-size: 8rem;
          font-weight: 900;
          margin: 0;
          line-height: 1;
          color: hsl(var(--primary));
          letter-spacing: -0.04em;
        }
        .not-found-heading {
          font-size: 2rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
        }
        .not-found-text {
          font-size: 1.125rem;
          color: hsl(var(--muted-foreground));
          margin: 0 0 2rem;
          line-height: 1.6;
        }
        .not-found-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          font-weight: 700;
          font-size: 1.125rem;
          border-radius: 0.75rem;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .not-found-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px hsl(var(--primary) / 0.3);
        }
        @media (max-width: 640px) {
          .not-found-code { font-size: 5rem; }
          .not-found-heading { font-size: 1.5rem; }
          .not-found-text { font-size: 1rem; }
        }
      `}} />
    </div>
  );
}

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada | LearnYos',
  description: 'La página que buscas no existe o fue movida.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        .not-found-btn {
          display: inline-block;
          padding: 0.875rem 2rem;
          background: white;
          color: #667eea;
          font-weight: 700;
          font-size: 1.125rem;
          border-radius: 0.75rem;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .not-found-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
      `}</style>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
      }}>
        <h1 style={{
          fontSize: '8rem',
          fontWeight: '900',
          margin: '0',
          lineHeight: '1',
          textShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          margin: '1rem 0 0.5rem',
        }}>
          Página no encontrada
        </h2>
        <p style={{
          fontSize: '1.125rem',
          opacity: 0.9,
          margin: '0 0 2rem',
          lineHeight: 1.6,
        }}>
          La página que buscas no existe, fue movida o no está disponible.
        </p>
        <Link href="/" className="not-found-btn">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

"use client";

/**
 * ============================================
 * GOOGLE AUTH BUTTON
 * ============================================
 * 
 * Botón para autenticación con Google.
 * Convertido a CSS puro con estilos mejorados.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";

export const GoogleAuthButton = () => {
  const [loading, setLoading] = useState(false);

  const loginGoogle = () => {
    setLoading(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.VITE_BACKEND_URL || '';
    if (typeof window !== 'undefined') {
      window.location.href = `${backendUrl}/auth/google`;
    }
  };

  return (
    <>
      <button
        onClick={loginGoogle}
        disabled={loading}
        className={`google-auth-button ${loading ? 'google-auth-button-loading' : ''}`}
      >
        {loading ? (
          <>
            <Loader2 className="google-auth-button-spinner" />
            <span>Redirigiendo a Google...</span>
          </>
        ) : (
          <>
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google"
              width="20"
              height="20"
              className="google-auth-button-icon"
            />
            Continuar con Google
          </>
        )}
      </button>

      <style jsx>{`
        .google-auth-button {
          width: 100%;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          padding: 0.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition-base);
          background-color: white;
          color: hsl(var(--foreground));
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .google-auth-button:hover:not(:disabled) {
          background-color: rgb(243 244 246);
        }

        .google-auth-button-loading {
          opacity: 0.6;
          pointer-events: none;
          background-color: rgb(229 231 235);
        }

        .google-auth-button-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .google-auth-button-spinner {
          width: 1.25rem;
          height: 1.25rem;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}

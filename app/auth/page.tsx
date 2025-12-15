"use client"

/**
 * ============================================
 * PÁGINA DE AUTENTICACIÓN
 * ============================================
 * 
 * Esta página permite a los usuarios:
 * - Iniciar sesión con email y contraseña
 * - Registrarse con email, nombre y contraseña
 * - Autenticarse con Google
 * 
 * Utiliza ApiService para todas las operaciones de autenticación.
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '@/services/apiService';
import type { LoginInput, RegisterInput } from '@/types';
import '@/styles/pages/auth.css';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  // Estados para el formulario
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Estados para los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  /**
   * Maneja el envío del formulario de login
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      // Validar campos
      if (!email || !password) {
        setFormError('Por favor, completa todos los campos');
        setLoading(false);
        return;
      }

      // Validar formato de email
      if (!apiService.isValidEmail(email)) {
        setFormError('Por favor, ingresa un email válido');
        setLoading(false);
        return;
      }

      // Realizar login usando ApiService
      const loginData: LoginInput = {
        email: email.trim(),
        password: password,
      };

      const response = await apiService.login(loginData);
      
      if (response && response.token && response.user) {
        // Redirigir al dashboard después de login exitoso
        router.push('/dashboard');
        router.refresh();
      } else {
        setFormError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setFormError(error?.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario de registro
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      // Validar campos
      if (!email || !password || !name) {
        setFormError('Por favor, completa todos los campos');
        setLoading(false);
        return;
      }

      // Validar formato de email
      if (!apiService.isValidEmail(email)) {
        setFormError('Por favor, ingresa un email válido');
        setLoading(false);
        return;
      }


      // Validar longitud de contraseña
      if (password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      // Realizar registro usando ApiService
      const registerData: RegisterInput = {
        email: email.trim(),
        password: password,
        name: name.trim(),
      };

      const response = await apiService.register(registerData);
      
      if (response && response.token && response.user) {
        // Redirigir al dashboard después de registro exitoso
        router.push('/dashboard');
        router.refresh();     
      } else {       
        setFormError('Error al registrarse. Por favor, intenta de nuevo.');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      setFormError(error?.message || 'Error al registrarse. El email podría estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <CardHeader className="auth-card-header">
          <CardTitle className="auth-title">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </CardTitle>
        </CardHeader>
        <CardContent className="auth-card-content">
          {/* Mensajes de error */}
          {(error || formError) && (
            <Alert className="auth-alert" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formError || (
                  error === 'google_failed' && 'Error al autenticarse con Google. Por favor, intenta de nuevo.'
                ) || (
                  error === 'token_invalid' && 'Token de autenticación inválido. Por favor, intenta de nuevo.'
                ) || (
                  'Error de autenticación. Por favor, intenta de nuevo.'
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Formulario de Login/Registro */}
          <form 
            onSubmit={isLogin ? handleLogin : handleRegister}
            className="auth-form"
          >
            {/* Campo de nombre (solo en registro) */}
            {!isLogin && (
              <div className="auth-form-group">
                <label htmlFor="name" className="auth-label">
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="auth-input"
                  disabled={loading}
                  required={!isLogin}
                />
              </div>
            )}

            {/* Campo de email */}
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="auth-input"
                disabled={loading}
                required
              />
            </div>

            {/* Campo de contraseña */}
            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            {/* Botón de submit */}
            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>{isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="auth-divider">
            <span className="auth-divider-text">o</span>
          </div>

          {/* Botón de Google Auth */}
          <GoogleAuthButton />

          {/* Toggle entre Login y Registro */}
          <div className="auth-toggle">
            <p className="auth-toggle-text">
              {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormError(null);
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="auth-toggle-link"
                disabled={loading}
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

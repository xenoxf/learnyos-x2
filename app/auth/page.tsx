"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  User,
  SplitIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import type { LoginInput, RegisterInput } from "@/types";
import { toast } from "@/hooks/use-toast";
import styles from "@/styles/auth.module.css";
import Link from "next/link";
import type { Metadata } from "next";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (formError) {
      toast({
        title: "Error",
        description: formError,
        duration: 4000,
      });
    }

    if (apiService.isAuthenticated()) {
      router.push("/study");
    }
  }, [formError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setFormError("Por favor, completa todos los campos");
        setLoading(false);
        return;
      }

      if (!apiService.isValidEmail(email)) {
        setFormError("Por favor, ingresa un email válido");
        setLoading(false);
        return;
      }

      const loginData: LoginInput = {
        email: email.trim(),
        password: password,
      };

      const response = await apiService.login(loginData);

      if (response && response.token && response.user) {
        router.push("/study");
        router.refresh();
      } else {
        setFormError("Error al iniciar sesión. Por favor, intenta de nuevo.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión. Por favor, verifica tus credenciales.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      if (!email || !password || !name) {
        setFormError("Por favor, completa todos los campos");
        setLoading(false);
        return;
      }

      if (!apiService.isValidEmail(email)) {
        setFormError("Por favor, ingresa un email válido");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setFormError("La contraseña debe tener al menos 6 caracteres");
        setLoading(false);
        return;
      }

      const registerData: RegisterInput = {
        email: email.trim(),
        password: password,
        name: name.trim(),
      };

      const response = await apiService.register(registerData);

      if (response && response.token && response.user) {
        router.push("/study");
        router.refresh();
      } else {
        setFormError("Error al registrarse. Por favor, intenta de nuevo.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al registrarse. El email podría estar en uso.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    router.push("/study");
    router.refresh();
  };

  const handleGoogleError = (errorMessage: string) => {
    setFormError(errorMessage);
  };

  return (
    <div className={styles.authPage}>
      <Link className={styles.authBtnVolver} href="/">
        <SplitIcon color="white" />
      </Link>

      <div className={styles.auth}>
        <div className={styles.containerTitle}>
          <h1 className={styles.logo}>LearnYos</h1>
        </div>

        <Card className={styles.authWindow}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </CardTitle>
          </CardHeader>

          <CardContent className={styles.cardContent}>
            {(error || formError) && (
              <div className={styles.errorAlert}>
                <AlertCircle className={styles.errorIcon} />
                <span className={styles.errorText}>
                  {formError ||
                    (error === "google_failed" &&
                      "Error al autenticarse con Google. Por favor, intenta de nuevo.") ||
                    (error === "token_invalid" &&
                      "Token de autenticación inválido. Por favor, intenta de nuevo.") ||
                    "Error de autenticación. Por favor, intenta de nuevo."}
                </span>
              </div>
            )}

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>O continúa con</span>
              <div className={styles.dividerLine} />
            </div>
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>O continúa con email</span>
              <div className={styles.dividerLine} />
            </div>

            <form
              className={styles.authForm}
              onSubmit={isLogin ? handleLogin : handleRegister}
            >
              {!isLogin && (
                <div className={styles.authContainerInput}>
                  <label className={styles.authLabel}>NickName</label>
                  <div className={styles.authInput}>
                    <User className={styles.authIcon} />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      disabled={loading}
                      required={!isLogin}
                      className={styles.inputField}
                    />
                  </div>
                </div>
              )}

              <div className={styles.authContainerInput}>
                <label className={styles.authLabel}>Correo Electrónico</label>
                <div className={styles.authInput}>
                  <Mail className={styles.authIcon} />
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.authContainerInput}>
                <label className={styles.authLabel}>Contraseña</label>
                <div className={styles.authInput}>
                  <Lock className={styles.authIcon} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={6}
                    className={styles.inputField}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeButton}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className={styles.eyeIcon} />
                    ) : (
                      <Eye className={styles.eyeIcon} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.authBtn}
              >
                {loading ? (
                  <>
                    <Loader2 className={styles.loaderIcon} />
                    <span>
                      {isLogin ? "Iniciando sesión..." : "Creando cuenta..."}
                    </span>
                  </>
                ) : (
                  <span>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</span>
                )}
              </button>
            </form>

            <div className={styles.toggleAuth}>
              {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormError(null);
                  setEmail("");
                  setPassword("");
                  setName("");
                  setShowPassword(false);
                }}
                className={styles.toggleAuthButton}
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className={styles.footer}>
          <p>
            Al continuar, aceptas nuestros términos y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="p-4">Cargando...</div>}>
      <AuthContent />
    </Suspense>
  );
}

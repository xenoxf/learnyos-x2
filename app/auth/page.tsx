"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Mail, Lock, User, SplitIcon } from "lucide-react";
import { apiService } from "@/services/apiService";
import type { LoginInput, RegisterInput } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
        router.push("/dashboard");
        router.refresh();
      } else {
        setFormError("Error al iniciar sesión. Por favor, intenta de nuevo.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setFormError(
        error?.message ||
          "Error al iniciar sesión. Por favor, verifica tus credenciales.",
      );
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
        router.push("/dashboard");
        router.refresh();
      } else {
        setFormError("Error al registrarse. Por favor, intenta de nuevo.");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      setFormError(
        error?.message || "Error al registrarse. El email podría estar en uso.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleError = (errorMessage: string) => {
    setFormError(errorMessage);
  };

  return (
    <div className="auth-page">
      <button className="btn-volver">
        <SplitIcon color="white" />
      </button>

      <div className="auth">
        <div className="container-title">
          <h1 className="text-foreground">LearnYos</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}</CardTitle>
          </CardHeader>

          <CardContent>
            {(error || formError) && (
              <div>
                <AlertCircle />
                <span>
                  {formError ||
                    (error === "google_failed" &&
                      "Error al autenticarse con Google. Por favor, intenta de nuevo.") ||
                    (error === "token_invalid" &&
                      "Token de autenticación inválido. Por favor, intenta de nuevo.") ||
                    "Error de autenticación. Por favor, intenta de nuevo."}
                </span>
              </div>
            )}

            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            <div>
              <div />
              <div>
                <span>O continúa con email</span>
              </div>
            </div>

            <form className="auth-form" onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <div>
                  <label>NickName</label>
                  <div>
                    <User />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      disabled={loading}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label>Correo Electrónico</label>
                <div>
                  <Mail />
                  <input
                  className="auth-input"
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Contraseña</label>
                <div>
                  <Lock />
                  <input
                  className="auth-input"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 />
                    <span>{isLogin ? "Iniciando sesión..." : "Creando cuenta..."}</span>
                  </>
                ) : (
                  <span>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</span>
                )}
              </button>
            </form>

            <div>
              {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormError(null);
                  setEmail("");
                  setPassword("");
                  setName("");
                }}
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div>
          <p>Al continuar, aceptas nuestros términos y política de privacidad</p>
        </div>
      </div>
    </div>
  );
}

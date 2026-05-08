"use client";
import React, { useState, useMemo } from "react";
import styles from "@/styles/landing.module.css";
import { Button } from "./ui/button";
import { AuthFG } from "./AuthFG";
import { ThemeToggle } from "./ThemeToggle";
import { useRouter } from "next/navigation";
import LoadingModal from "./loadingModal";
import Image from "next/image";
import {
  Brain,
  FileText,
  Layers,
  Sparkles,
  Target,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  PenTool,
  BarChart3,
  Shield,
} from "lucide-react";
import { authService } from "@/services/authService";

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle "Comenzar" / "Comenzar Gratis" button
  const handleOpenAuth = async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // If has token AND user data, validate and redirect
    if (token && userStr) {
      setLoading(true);
      try {
        const user = JSON.parse(userStr);

        // If guest, redirect directly (guests can browse)
        if (user?.isGuest === true) {
          router.push("/study");
          return;
        }

        // Verify token with backend
        const isValid = await authService.verifyToken();
        if (isValid) {
          router.push("/study");
          return;
        }

        // Token invalid, clear and show auth modal
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    }

    // No valid session, show auth modal
    setShowAuthModal(true);
  };

  // Handle "Comenzar como invitado" button
  const handleLoginAsGuest = async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // If already has a valid token (user or guest), redirect to study
    if (token && userStr) {
      setLoading(true);
      try {
        const isValid = await authService.verifyToken();
        if (isValid) {
          router.push("/study");
          return;
        }
      } catch {
        // Token invalid, fall through to guest login
      } finally {
        setLoading(false);
      }
    }

    // No valid token, login as guest
    setLoading(true);
    try {
      await authService.loginAsGuest();
      router.push("/study");
    } catch {
      setLoading(false);
    }
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const features = useMemo(
    () => [
      {
        icon: Target,
        title: "Ponte a Prueba",
        description:
          "Evalúa tus conocimientos con exámenes diseñados para retar tu comprensión real.",
      },
      {
        icon: Layers,
        title: "Flashcards de la Comunidad",
        description:
          "Accede a miles de tarjetas creadas por otros usuarios o crea las tuyas propias.",
      },
      {
        icon: Sparkles,
        title: "Junior IA",
        description:
          "Tu tutor personal disponible 24/7 para explicarte conceptos complejos de forma sencilla.",
      },
      {
        icon: Brain,
        title: "Aprendizaje Colaborativo",
        description:
          "Comparte tus mejores exámenes y ayuda a otros a dominar nuevos temas.",
      },
      {
        icon: Shield,
        title: "Progreso Seguro",
        description:
          "Sigue tu evolución y descubre en qué áreas necesitas reforzar más.",
      },
      {
        icon: CheckCircle2,
        title: "Validación Inmediata",
        description:
          "Recibe feedback instantáneo en cada respuesta para aprender de tus errores.",
      },
    ],
    [],
  );

  const steps = useMemo(
    () => [
      {
        title: "Explora la comunidad",
        description: "Busca exámenes y flashcards creados por otros usuarios sobre cualquier tema que quieras dominar. ¡El conocimiento es compartido!",
        icon: BookOpen,
        image: "/landing/community-explore.png",
        instruction: "Captura de pantalla: Panel principal o buscador donde se vean exámenes y flashcards de otros usuarios.",
      },
      {
        title: "Ponte a prueba",
        description: "Realiza exámenes interactivos y practica con flashcards dinámicas. Nuestro sistema está diseñado para que retengas la información de verdad.",
        icon: Target,
        image: "/landing/quiz-session.png",
        instruction: "Captura de pantalla: Una sesión activa de examen o flashcards mostrando una pregunta.",
      },
      {
        title: "Consulta con Junior IA",
        description: "¿No entiendes una respuesta? Junior IA te lo explica. Nuestro tutor inteligente está integrado para resolver tus dudas al instante.",
        icon: Sparkles,
        image: "/landing/ai-chat-help.png",
        instruction: "Captura de pantalla: Chat con Junior IA explicando algún concepto educativo.",
      },
      {
        title: "Crea y comparte",
        description: "Diseña tus propios exámenes y flashcards en minutos. Compártelos con la comunidad y conviértete en un referente de aprendizaje.",
        icon: PenTool,
        image: "/landing/create-content.png",
        instruction: "Captura de pantalla: Pantalla de creación de nuevo examen o conjunto de flashcards.",
      },
    ],
    []
  );

  const tools = useMemo(
    () => [
      {
        icon: FileText,
        name: "Exámenes",
        description: "Evalúa lo que sabes con pruebas reales",
        image: "/tools/quiz-preview.png",
        imageAlt:
          "Vista previa de examen con preguntas de opción múltiple en LearnYos",
      },
      {
        icon: Layers,
        name: "Flashcards",
        description: "Memoriza compartiendo con otros",
        image: "/tools/flashcards-preview.png",
        imageAlt:
          "Tarjetas de estudio flashcards comunitarias",
      },
      {
        icon: BarChart3,
        name: "Junior IA",
        description: "Tu tutor inteligente personal",
        image: "/tools/quiz.png",
        imageAlt: "Chat IA para resolver dudas de estudio",
      },
    ],
    [],
  );

  return (
    <>
      <main className={styles.container} id="inicio">
        {/* Header */}
        <header className={styles.header} role="banner">
          <div className={styles.headerContent}>
            <div className={styles.headerBrand}>
              <div className={styles.brandIcon} aria-hidden="true">
                <Image
                  src="/logo-100x100.png"
                  alt="LearnYos Logo"
                  width={100}
                  height={100}
                  className={styles.brandIconImage}
                />
              </div>
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>LearnYos</span>
                <div className={styles.brandSubtitle}>
                  Evalúa y comparte conocimiento
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <ThemeToggle />
              <Button
                className={styles.headerButton}
                onClick={handleOpenAuth}
                aria-label="Comenzar gratis"
              >
                <span className={styles.headerButtonSmallText}>Comenzar</span>
                <span className={styles.headerButtonLargeText}>
                  Comenzar Gratis
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className={styles.heroSection} aria-labelledby="hero-title">
          <div className={styles.heroBackground} aria-hidden="true" />
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroTextInner}>
                <div
                  className={styles.heroTag}
                  role="complementary"
                  aria-label="Tag promocional"
                >
                  🚀 La red social del aprendizaje activo
                </div>
                <h1 id="hero-title" className={styles.heroTitle}>
                  Pon a prueba tu <br />
                  <span className={styles.heroTitleGradient}>conocimiento</span>
                </h1>
                <p className={styles.heroDescription}>
                  No solo estudies, demuestra lo que sabes. Crea exámenes y flashcards,
                  compártelos con la comunidad y aprende con nuestro tutor IA.
                </p>
              </div>
              <div className={styles.heroCTA}>
                <Button
                  className={styles.headerButton}
                  onClick={handleLoginAsGuest}
                  aria-label="Comenzar ahora gratis"
                >
                  Comenzar como invitado
                  <ArrowRight className={styles.buttonArrow} size={18} />
                </Button>
              </div>
            </div>
            <div
              className={styles.heroImage}
              aria-label="Ilustración de la plataforma LearnYos mostrando un estudiante usando las herramientas de evaluación"
              role="img"
            >
              <div className={styles.heroImageBox}>
                <Image
                  src="/landing/hero-study.png"
                  alt="Ilustración de estudiante usando LearnYos para realizar exámenes y compartir flashcards"
                  width={600}
                  height={400}
                  priority
                  loading="eager"
                  className={styles.heroImageContent}
                />
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className={styles.howToUseSection} id="como-usar">
          <div className={styles.howToUseContent}>
            <div className={styles.howToUseHeader}>
              <h2 className={styles.howToUseTitle}>Cómo usar LearnYos</h2>
              <p className={styles.howToUseDescription}>
                Domina la plataforma en 4 sencillos pasos y potencia tu aprendizaje.
              </p>
            </div>

            <div className={styles.howToUseGrid}>
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div 
                    key={index} 
                    className={`${styles.howToUseStep} ${index % 2 !== 0 ? styles.howToUseStepReverse : ""}`}
                  >
                    <div className={styles.stepContent}>
                      <div className={styles.stepNumber}>{index + 1}</div>
                      <h3 className={styles.stepTitle}>{step.title}</h3>
                      <p className={styles.stepDescription}>{step.description}</p>
                    </div>
                    <div className={styles.stepImageContainer}>
                      <Image 
                        src={step.image} 
                        alt={step.title} 
                        fill 
                        className={styles.stepImage}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      /> 
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className={styles.toolsSection} aria-labelledby="tools-title">
          <div className={styles.toolsSectionContent}>
            <div className={styles.toolsHeader}>
              <h2 id="tools-title" className={styles.toolsTitle}>
                Herramientas de Evaluación
              </h2>
              <p className={styles.toolsDescription}>
                Diseñadas para validar tu conocimiento de forma efectiva.
              </p>
            </div>
            <div className={styles.toolsShowcase}>
              {tools.map((tool, index) => {
                const ToolIcon = tool.icon;
                const isEven = index % 2 === 0;
                return (
                  <button
                    key={index}
                    className={`${styles.showcasePanel} ${isEven ? styles.panelLeft : styles.panelRight}`}
                    onClick={handleLoginAsGuest}
                    type="button"
                    aria-label={`${tool.name}: ${tool.description}`}
                  >
                    <div className={styles.panelContent}>
                      <div className={styles.panelNumber}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <div className={styles.panelIcon}>
                        <ToolIcon size={28} aria-hidden="true" />
                      </div>
                      <h3 className={styles.panelTitle}>{tool.name}</h3>
                      <p className={styles.panelDescription}>
                        {tool.description}
                      </p>
                      <div className={styles.panelCTA}>
                        <span>Probar ahora</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                    <div className={styles.panelVisual}>
                      <div className={styles.deviceFrame}>
                        <div className={styles.deviceHeader}>
                          <div className={styles.deviceDot}></div>
                          <div className={styles.deviceDot}></div>
                          <div className={styles.deviceDot}></div>
                        </div>
                        <div className={styles.deviceScreen}>
                          <Image
                            src={tool.image}
                            alt={tool.imageAlt}
                            fill
                            loading="lazy"
                            className={styles.deviceImage}
                            sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 40vw"
                          />
                        </div>
                      </div>
                      <div className={styles.deviceGlow}></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className={styles.featuresSection}
          aria-labelledby="features-title"
        >
          <div className={styles.featuresSectionContent}>
            <div className={styles.featuresHeader}>
              <h2 id="features-title" className={styles.featuresTitle}>
                ¿Por qué usar LearnYos?
              </h2>
              <p className={styles.featuresDescription}>
                Convertimos el estudio pasivo en aprendizaje activo y social.
              </p>
            </div>
            <div className={styles.featuresGrid} role="list">
              {features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <article
                    key={index}
                    className={styles.featureCard}
                    role="listitem"
                  >
                    <div className={styles.featureCardHeader}>
                      <div
                        className={styles.featureCardIcon}
                        aria-hidden="true"
                      >
                        <FeatureIcon size={24} />
                      </div>
                      <h3 className={styles.featureCardTitle}>
                        {feature.title}
                      </h3>
                    </div>
                    <div className={styles.featureCardContent}>
                      <p className={styles.featureCardDescription}>
                        {feature.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section
          className={styles.securitySection}
          aria-labelledby="security-title"
        >
          <div className={styles.securityContent}>
            <Shield className={styles.securityIcon} size={48} />
            <h2 id="security-title" className={styles.securityTitle}>
              Tu conocimiento es privado
            </h2>
            <p className={styles.securityText}>
              Tú decides qué compartir con la comunidad. Tus datos y progreso
              están siempre protegidos con nosotros.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.ctaContent}>
            <h2 id="cta-title" className={styles.ctaTitle}>
              Únete a la comunidad hoy
            </h2>
            <p className={styles.ctaDescription}>
              Comienza a evaluar lo que sabes de forma gratuita
            </p>
            <Button
              className={styles.ctaButton}
              onClick={handleLoginAsGuest}
              size="lg"
              aria-label="Iniciar como invitado"
            >
              Iniciar como Invitado
              <ArrowRight size={18} />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer} role="contentinfo">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerBrandIcon} aria-hidden="true">
                <Image
                  src="/logo-100x100.png"
                  alt="LearnYos Logo"
                  width={100}
                  height={100}
                  className={styles.footerBrandIconImage}
                />
              </div>
              <span className={styles.footerBrandName}>LearnYos</span>
            </div>
            <div className={styles.footerLinks}>
              <a
                href="/terms.html"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Términos y Condiciones
              </a>
            </div>
            <p className={styles.footerCopy}>
              © {new Date().getFullYear()} LearnYos. Todos los derechos
              reservados.
            </p>
          </div>
        </footer>
      </main>

      {/* Auth Modal */}
      {showAuthModal && <AuthFG onClose={handleCloseAuth} />}
      {loading && <LoadingModal />}
    </>
  );
};

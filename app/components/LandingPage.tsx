"use client";
import React, { useState, useMemo } from "react";
import styles from "@/styles/landing.module.css";
import { Button } from "./ui/button";
import { AuthFG } from "./AuthFG";
import { ThemeToggle } from "./ThemeToggle";
import { apiService } from "@/services/apiService";
import { useRouter } from "next/navigation";
import LoadingModal from "./loadingModal";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  FileText,
  Layers,
  Sparkles,
  Languages,
  Target,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  PenTool,
  BarChart3,
  Shield,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleOpenAuth = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.push("/study");
      return;
    }
    setShowAuthModal(true);
  };

  const handleLoginAsGuest = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        setLoading(false);
        router.push("/study");
        return;
      }
      await apiService.loginAsGuest();
      setLoading(false);
      router.push("/study");
    } catch (_error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "No se pudo iniciar como invitado. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const features = useMemo(
    () => [
      {
        icon: Brain,
        title: "Ayuda Inteligente",
        description:
          "Obtén respuestas claras y explicaciones que se adaptan a tu forma de aprender.",
      },
      {
        icon: FileText,
        title: "Quizzes Personalizados",
        description:
          "Crea cuestionarios sobre cualquier tema y recibe retroalimentación al instante.",
      },
      {
        icon: Layers,
        title: "Flashcards Efectivas",
        description:
          "Sistema de repaso espaciado para recordar lo que estudias por más tiempo.",
      },
      {
        icon: Sparkles,
        title: "Notas Automáticas",
        description:
          "Convierte cualquier contenido en notas organizadas y fáciles de repasar.",
      },
      {
        icon: Languages,
        title: "Traductor Contextual",
        description:
          "Traduce textos manteniendo el significado y contexto original.",
      },
      {
        icon: Target,
        title: "Ritmo Personal",
        description:
          "El contenido se adapta a tu velocidad y nivel de comprensión.",
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        title: "Estudia de forma más eficiente",
        description:
          "Identifica qué necesitas reforzar y enfoca tu tiempo en lo que realmente importa.",
        icon: Clock,
      },
      {
        title: "Retén más información",
        description:
          "Técnicas de active recall y repaso espaciado para mejorar tu memoria.",
        icon: CheckCircle2,
      },
      {
        title: "Material ilimitado",
        description:
          "Genera quizzes, flashcards y notas sobre cualquier tema que necesites.",
        icon: Sparkles,
      },
    ],
    []
  );

  const tools = useMemo(
    () => [
      { icon: BookOpen, name: "Quizzes", description: "Pon a prueba tu conocimiento" },
      { icon: Layers, name: "Flashcards", description: "Memoriza de forma efectiva" },
      { icon: PenTool, name: "Notas", description: "Organiza tu aprendizaje" },
      { icon: BarChart3, name: "Progreso", description: "Mira cuánto has avanzado" },
    ],
    []
  );

  return (
    <>
      <main className={styles.container} id="inicio">
        {/* Header */}
        <header className={styles.header} role="banner">
          <div className={styles.headerContent}>
            <div className={styles.headerBrand}>
              <div className={styles.brandIcon} aria-hidden="true">
                <span className={styles.brandIconText}>L</span>
              </div>
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>LearnyOS</span>
                <div className={styles.brandSubtitle}>Tu compañero de estudio</div>
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
                  📚 Tu espacio de aprendizaje personal
                </div>
                <h1 id="hero-title" className={styles.heroTitle}>
                  Estudia de forma más{" "}
                  <span className={styles.heroTitleGradient}>inteligente</span>
                </h1>
                <p className={styles.heroDescription}>
                  LearnyOS te ayuda a aprender mejor con herramientas diseñadas para potenciar tu estudio.
                  Crea quizzes, flashcards y notas al instante.
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
              aria-label="Ilustración de la plataforma"
            >
              <div className={styles.heroImageBox}>
                <div className={styles.heroImageContent}>
                  <div className={styles.heroImageHeader}>
                    <div
                      className={`${styles.heroImageHeaderDot} ${styles.heroImageHeaderDotRed}`}
                      aria-hidden="true"
                    />
                    <div
                      className={`${styles.heroImageHeaderDot} ${styles.heroImageHeaderDotYellow}`}
                      aria-hidden="true"
                    />
                    <div
                      className={`${styles.heroImageHeaderDot} ${styles.heroImageHeaderDotGreen}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className={styles.heroImageBars}>
                    <div
                      className={`${styles.heroImageBar} ${styles.heroImageBar1}`}
                      aria-hidden="true"
                    />
                    <div
                      className={`${styles.heroImageBar} ${styles.heroImageBar2}`}
                      aria-hidden="true"
                    />
                    <div
                      className={`${styles.heroImageBar} ${styles.heroImageBar3}`}
                      aria-hidden="true"
                    />
                    <div className={styles.heroImageGrid}>
                      <div
                        className={`${styles.heroImageGridItem} ${styles.heroImageGridItem1}`}
                        aria-hidden="true"
                      >
                        <span>📖</span>
                      </div>
                      <div
                        className={`${styles.heroImageGridItem} ${styles.heroImageGridItem2}`}
                        aria-hidden="true"
                      >
                        <span>✏️</span>
                      </div>
                      <div
                        className={`${styles.heroImageGridItem} ${styles.heroImageGridItem3}`}
                        aria-hidden="true"
                      >
                        <span>🎯</span>
                      </div>
                      <div
                        className={`${styles.heroImageGridItem} ${styles.heroImageGridItem4}`}
                        aria-hidden="true"
                      >
                        <span>📊</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className={styles.toolsSection} aria-labelledby="tools-title">
          <div className={styles.toolsSectionContent}>
            <div className={styles.toolsHeader}>
              <h2 id="tools-title" className={styles.toolsTitle}>
                Todo lo que necesitas para estudiar
              </h2>
              <p className={styles.toolsDescription}>
                Herramientas prácticas para cada etapa de tu aprendizaje
              </p>
            </div>
            <div className={styles.toolsGrid} role="list">
              {tools.map((tool, index) => {
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={index}
                    className={styles.toolCard}
                    role="listitem"
                    onClick={handleLoginAsGuest}
                    type="button"
                  >
                    <div className={styles.toolCardIcon}>
                      <ToolIcon size={24} />
                    </div>
                    <h3 className={styles.toolCardTitle}>{tool.name}</h3>
                    <p className={styles.toolCardDescription}>{tool.description}</p>
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
                Características que marcan la diferencia
              </h2>
              <p className={styles.featuresDescription}>
                Cada función está diseñada para hacer tu estudio más efectivo.
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

        {/* Benefits Section */}
        <section
          className={styles.benefitsSection}
          aria-labelledby="benefits-title"
        >
          <div className={styles.benefitsSectionContent}>
            <div className={styles.benefitsHeader}>
              <h2 id="benefits-title" className={styles.benefitsTitle}>
                ¿Por qué elegir LearnyOS?
              </h2>
              <p className={styles.benefitsDescription}>
                Métodos comprobados para optimizar tu aprendizaje
              </p>
            </div>
            <div className={styles.benefitsGrid}>
              {benefits.map((benefit, index) => {
                const BenefitIcon = benefit.icon;
                return (
                  <article
                    key={index}
                    className={styles.benefitCard}
                    role="listitem"
                  >
                    <div
                      className={styles.benefitIcon}
                      aria-hidden="true"
                    >
                      <BenefitIcon size={32} />
                    </div>
                    <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                    <p className={styles.benefitDescription}>
                      {benefit.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className={styles.securitySection} aria-labelledby="security-title">
          <div className={styles.securityContent}>
            <Shield className={styles.securityIcon} size={48} />
            <h2 id="security-title" className={styles.securityTitle}>
              Tu privacidad es primero
            </h2>
            <p className={styles.securityText}>
              Tus datos están protegidos y nunca compartimos tu información con terceros.
              Estudia con tranquilidad.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.ctaContent}>
            <h2 id="cta-title" className={styles.ctaTitle}>
              Comienza a estudiar mejor hoy
            </h2>
            <p className={styles.ctaDescription}>
              Prueba la aplicación sin registrarte
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
                <span className={styles.footerBrandIconText}>L</span>
              </div>
              <span className={styles.footerBrandName}>LearnyOS</span>
            </div>
            <div className={styles.footerLinks}>
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                Términos y Condiciones
              </a>
            </div>
            <p className={styles.footerCopy}>
              © {new Date().getFullYear()} LearnyOS. Todos los derechos reservados.
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

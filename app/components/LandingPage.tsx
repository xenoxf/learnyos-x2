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
  Sparkles,
  Brain,
  Layers,
  FileText,
  Languages,
  Target,
  Zap,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleOpenAuth = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        const isValid = await apiService.verifyToken();
        if (isValid) {
          setLoading(false);
          router.push("/study");
          return;
        }
      }
      setLoading(false);
      setShowAuthModal(true);
    } catch (_error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "No se pudo verificar la sesión. Intenta de nuevo.",
        variant: "destructive",
      });
      setShowAuthModal(true);
    }
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const features = useMemo(
    () => [
      {
        icon: Brain,
        title: "Chatbot IA Avanzado",
        description:
          "Obtén respuestas instantáneas y explicaciones personalizadas adaptadas a tu nivel.",
        gradient: "gradientBlue",
      },
      {
        icon: FileText,
        title: "Generador de Quiz",
        description:
          "Crea cuestionarios adaptados a tu nivel de estudio con retroalimentación inmediata.",
        gradient: "gradientGreen",
      },
      {
        icon: Layers,
        title: "Flashcards Inteligentes",
        description:
          "Sistema de repetición espaciada basado en evidencia científica para mejor retención.",
        gradient: "gradientPurple",
      },
      {
        icon: Sparkles,
        title: "Generador de Notas",
        description:
          "Transforma cualquier contenido en notas estructuradas y fáciles de estudiar.",
        gradient: "gradientOrange",
      },
      {
        icon: Languages,
        title: "Traductor IA",
        description:
          "Traduce textos técnicos manteniendo el contexto y precisión académica.",
        gradient: "gradientIndigo",
      },
      {
        icon: Target,
        title: "Aprendizaje Personalizado",
        description:
          "Contenido que se adapta automáticamente a tu ritmo y estilo de aprendizaje.",
        gradient: "gradientYellow",
      },
    ],
    []
  );

  const stats = useMemo(
    () => [
      { number: "10,000+", label: "Estudiantes activos", icon: Users },
      { number: "500k+", label: "Sesiones de estudio", icon: Clock },
      { number: "95%", label: "Mejora en retención", icon: TrendingUp },
      { number: "24/7", label: "Disponibilidad", icon: Zap },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        title: "Aprende 3x más rápido",
        description:
          "Nuestra IA identifica tus fortalezas y debilidades para optimizar cada sesión.",
        icon: Zap,
      },
      {
        title: "Retención comprobada",
        description:
          "Técnicas de active recall y spaced repetition validadas científicamente.",
        icon: CheckCircle2,
      },
      {
        title: "Sin límites de estudio",
        description:
          "Genera contenido ilimitado adaptado a cualquier materia o tema.",
        icon: Sparkles,
      },
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
                <div className={styles.brandSubtitle}>Powered by AI</div>
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
                  🚀 Revolución en el Aprendizaje con IA
                </div>
                <h1 id="hero-title" className={styles.heroTitle}>
                  Aprende más rápido con{" "}
                  <span className={styles.heroTitleGradient}>LearnyOS</span>
                </h1>
                <p className={styles.heroDescription}>
                  La plataforma de estudio más avanzada que combina inteligencia
                  artificial y metodologías probadas para maximizar tu
                  aprendizaje.
                </p>
              </div>
              <div className={styles.heroCTA}>
                <Button
                  className={styles.headerButton}
                  onClick={handleOpenAuth}
                  aria-label="Comenzar ahora gratis"
                >
                  Comenzar Ahora - Gratis
                  <ArrowRight className={styles.buttonArrow} size={18} />
                </Button>
              </div>
              <div className={styles.heroStats} role="region" aria-label="Estadísticas">
                {stats.map((stat, index) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={index} className={styles.heroStat}>
                      <StatIcon
                        className={styles.heroStatIcon}
                        size={20}
                        aria-hidden="true"
                      />
                      <div className={styles.heroStatNumber}>
                        {stat.number}
                      </div>
                      <div className={styles.heroStatLabel}>
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
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
                        <span>🤖</span>
                      </div>
                      <div
                        className={`${styles.heroImageGridItem} ${styles.heroImageGridItem2}`}
                        aria-hidden="true"
                      >
                        <span>📚</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                Herramientas Potenciadas por IA
              </h2>
              <p className={styles.featuresDescription}>
                Cada función está diseñada para acelerar tu aprendizaje y hacer
                que estudiar sea más efectivo.
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
                        className={`${styles.featureCardIcon} ${styles[feature.gradient]}`}
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
                ¿Por qué elegir LearnYos?
              </h2>
              <p className={styles.benefitsDescription}>
                Métodos comprobados científicamente para optimizar tu
                aprendizaje
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

        {/* CTA Section */}
        <section className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.ctaContent}>
            <h2 id="cta-title" className={styles.ctaTitle}>
              Comienza tu viaje de aprendizaje hoy
            </h2>
            <p className={styles.ctaDescription}>
              Únete a miles de estudiantes que ya están aprendiendo más rápido
              con LearnYos
            </p>
            <Button
              className={styles.ctaButton}
              onClick={handleOpenAuth}
              size="lg"
              aria-label="Comenzar gratis ahora"
            >
              Comenzar Gratis
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

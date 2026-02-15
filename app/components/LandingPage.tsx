"use client";
import React, { useState } from "react";
import { LandingThemeSelector } from "@/components/LandingThemeSelector";
import Link from "next/link";
import styles from "@/styles/landing.module.css";
import Header from "./Header";
import { Button } from "./ui/button";
import { AuthFG } from "./AuthFG";
import { ThemeToggle } from "./ThemeToggle";
import { apiService } from "@/services/apiService";
import { useRouter } from "next/navigation";
import LoadingModal from "./loadingModal";

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOpenAuth = () => {
    setLoading(true);
    if (apiService.isAuthenticated()) {
      setLoading(false);
      router.push("/study");
    } else {
      setLoading(false);
      setShowAuthModal(true);
    }
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const features = [
    {
      icon: "🤖",
      title: "Chatbot IA Avanzado",
      description:
        "Obtén respuestas instantáneas y explicaciones personalizadas.",
      gradient: "gradientBlue",
    },
    {
      icon: "📝",
      title: "Generador de Quiz",
      description: "Crea cuestionarios adaptados a tu nivel de estudio.",
      gradient: "gradientGreen",
    },
    {
      icon: "🃏",
      title: "Flashcards Inteligentes",
      description: "Sistema de repetición espaciada para mejor retención.",
      gradient: "gradientPurple",
    },
    {
      icon: "📚",
      title: "Generador de Notas",
      description: "Transforma contenido en notas estructuradas.",
      gradient: "gradientOrange",
    },
    {
      icon: "🌐",
      title: "Traductor IA",
      description: "Traduce textos manteniendo el contexto técnico.",
      gradient: "gradientIndigo",
    },
    {
      icon: "🎯",
      title: "Aprendizaje Personalizado",
      description: "Contenido adaptado a tu ritmo y preferencias.",
      gradient: "gradientYellow",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Estudiantes" },
    { number: "500k+", label: "Sesiones" },
    { number: "95%", label: "Mejora" },
    { number: "24/7", label: "Disponible" },
  ];

  return (
    <>
      <main className={styles.container}>
        {/* Header - not fixed on mobile */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerBrand}>
              <div className={styles.brandIcon}>
                <span className={styles.brandIconText}>L</span>
              </div>
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>LearnyOS</span>
                <div className={styles.brandSubtitle}>Powered by AI</div>
              </div>
            </div>
            <div className={styles.headerActions}>
              {/*<LandingThemeSelector />*/}
              <ThemeToggle />
              {/*<Link href="/auth" className={styles.headerSignIn}>
                Iniciar Sesión
              </Link>*/}
              <Button className={styles.headerButton} onClick={handleOpenAuth}>
                <span className={styles.headerButtonSmallText}>Comenzar</span>
                <span className={styles.headerButtonLargeText}>
                  Comenzar Gratis
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroTextInner}>
                <div className={styles.heroTag}>
                  🚀 Revolución en el Aprendizaje con IA
                </div>
                <h1 className={styles.heroTitle}>
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
                  className={/*styles.heroCTAButton*/ styles.headerButton}
                  onClick={handleOpenAuth}
                >
                  Comenzar Ahora - Gratis
                </Button>
              </div>
              <div className={styles.heroStats}>
                {stats.map((stat, index) => (
                  <div key={index} className={styles.heroStat}>
                    <div className={styles.heroStatNumber}>{stat.number}</div>
                    <div className={styles.heroStatLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.heroImage}>
              <div className={styles.heroImageBox}>
                <div className={styles.heroImageContent}>
                  <div className={styles.heroImageHeader}>
                    <div
                      className={`${styles.heroImageHeaderDot} ${styles.heroImageHeaderDotRed}`}
                    ></div>
                    <div
                      className={`${styles.heroImageHeaderDot} ${styles.heroImageHeaderDotYellow}`}
                    ></div>
                    <div
                      className={`${styles.heroImageHeaderDot} ${styles.heroImageHeaderDotGreen}`}
                    ></div>
                  </div>
                  <div className={styles.heroImageBars}>
                    <div
                      className={`${styles.heroImageBar} ${styles.heroImageBar1}`}
                    ></div>
                    <div
                      className={`${styles.heroImageBar} ${styles.heroImageBar2}`}
                    ></div>
                    <div
                      className={`${styles.heroImageBar} ${styles.heroImageBar3}`}
                    ></div>
                    <div className={styles.heroImageGrid}>
                      <div
                        className={`${styles.heroImageGridItem} ${styles.heroImageGridItem1}`}
                      >
                        <span>🤖</span>
                      </div>
                      <div
                        className={`${styles.heroImageGridItem} ${styles.heroImageGridItem2}`}
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
        <section className={styles.featuresSection}>
          <div className={styles.featuresSectionContent}>
            <div className={styles.featuresHeader}>
              <h2 className={styles.featuresTitle}>
                Herramientas Potenciadas por IA
              </h2>
              <p className={styles.featuresDescription}>
                Cada función está diseñada para acelerar tu aprendizaje y hacer
                que estudiar sea más efectivo.
              </p>
            </div>
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureCardHeader}>
                    <div
                      className={`${styles.featureCardIcon} ${styles[feature.gradient]}`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className={styles.featureCardTitle}>{feature.title}</h3>
                  </div>
                  <div className={styles.featureCardContent}>
                    <p className={styles.featureCardDescription}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerBrandIcon}>
                <span className={styles.footerBrandIconText}>L</span>
              </div>
              <span className={styles.footerBrandName}>LearnyOS</span>
            </div>

            <p className={styles.footerCopy}>
              © {new Date().getFullYear()} LearnyOS. Todos los derechos
              reservados.
            </p>
          </div>
        </footer>
      </main>

      {/* Auth Modal - Renderizado condicional */}
      {showAuthModal && <AuthFG onClose={handleCloseAuth} />}
      {loading ? <LoadingModal /> : null}
    </>
  );
};

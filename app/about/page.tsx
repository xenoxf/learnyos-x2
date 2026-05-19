import type { Metadata } from "next";
import Link from "next/link";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://learnyos.vercel.app";

export const metadata: Metadata = {
  title: "Sobre LearnYos — Plataforma de Estudio con Inteligencia Artificial",
  description:
    "Conocé LearnYos, la plataforma de aprendizaje activo que combina inteligencia artificial, exámenes online, flashcards compartidas y un tutor IA personal llamado Junior. Aprende más rápido, mejor y con otros.",
  keywords: [
    "sobre LearnYos",
    "plataforma de estudio IA",
    "aprendizaje activo",
    "tutor inteligente Junior",
    "exámenes online",
    "flashcards educativas",
    "estudio colaborativo",
    "inteligencia artificial educativa",
  ],
  openGraph: {
    title: "Sobre LearnYos — Plataforma de Estudio con IA",
    description:
      "Conocé la plataforma que transforma el estudio pasivo en aprendizaje activo con inteligencia artificial.",
    url: `${appUrl}/about`,
    type: "website",
  },
  alternates: {
    canonical: `${appUrl}/about`,
  },
};

const features = [
  {
    icon: "🎯",
    title: "Exámenes Online",
    text: "Creá y realizá exámenes interactivos sobre cualquier tema. Generá pruebas automáticamente con IA o diseñá las tuyas propias. Compartilas con la comunidad o mantenelas privadas.",
  },
  {
    icon: "🃏",
    title: "Flashcards Compartidas",
    text: "Accedé a miles de tarjetas de estudio creadas por otros usuarios o creá las tuyas. El sistema de repetición espaciada te ayuda a memorizar de forma eficiente.",
  },
  {
    icon: "✨",
    title: "Junior IA — Tutor Personal",
    text: "Tu tutor inteligente disponible 24/7. Junior IA puede explicarte conceptos complejos, resolver dudas, generar resúmenes y adaptarse a tu nivel de conocimiento.",
  },
  {
    icon: "📖",
    title: "Notas de Estudio con IA",
    text: "Generá notas de estudio organizadas automáticamente a partir de cualquier tema. La IA estructura la información de forma clara y fácil de repasar.",
  },
  {
    icon: "👥",
    title: "Comunidad de Aprendizaje",
    text: "Compartí tus mejores exámenes y flashcards. Descubrí contenido creado por otros estudiantes sobre cualquier materia. Aprendé de forma colaborativa.",
  },
  {
    icon: "🛡️",
    title: "Seguimiento de Progreso",
    text: "Visualizá tu evolución con estadísticas detalladas. Identificá tus áreas fuertes y las que necesitás reforzar. Medí tu mejora con datos reales.",
  },
];

const steps = [
  {
    number: 1,
    title: "Empezá gratis, sin registro",
    text: "Podés usar LearnYos como invitado sin crear una cuenta. Explorá exámenes, flashcards y herramientas de estudio inmediatamente.",
  },
  {
    number: 2,
    title: "Elegí cómo estudiar",
    text: "Realizá exámenes creados por la comunidad, practicá con flashcards, chateá con Junior IA o generá tus propios materiales de estudio con inteligencia artificial.",
  },
  {
    number: 3,
    title: "Creá y compartí",
    text: "Diseñá tus propios exámenes y flashcards. Compartilos con la comunidad para ayudar a otros estudiantes. Tu conocimiento vale y puede ayudar a alguien más.",
  },
  {
    number: 4,
    title: "Seguí tu progreso",
    text: "Creá una cuenta gratuita para guardar tu progreso, acceder a estadísticas detalladas y tener créditos diarios renovables para usar todas las funciones de IA.",
  },
];

const benefits = [
  {
    icon: "⚡",
    title: "Aprendizaje basado en evidencia",
    text: "Usamos técnicas probadas como retrieval practice (práctica de recuperación), spaced repetition (repetición espaciada) y feedback inmediato, todas respaldadas por la ciencia cognitiva.",
  },
  {
    icon: "🧠",
    title: "Inteligencia artificial al servicio del estudiante",
    text: "Junior IA no reemplaza al profesor, lo complementa. Está disponible cuando lo necesitás, sin horarios ni esperas, adaptándose a tu ritmo de aprendizaje.",
  },
  {
    icon: "👥",
    title: "Comunidad real de estudiantes",
    text: "No estás solo. Miles de estudiantes crean y comparten contenido todos los días. Encontrá material sobre tu materia, tu carrera o tu interés.",
  },
  {
    icon: "🛡️",
    title: "Gratuito y accesible",
    text: "LearnYos es gratuito con créditos diarios renovables. No necesitás pagar para acceder a las funciones esenciales. Educación de calidad al alcance de todos.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-container">
          <span className="about-tag">Sobre nosotros</span>
          <h1 className="about-title">
            Transformamos el estudio en{" "}
            <span className="about-title-accent">aprendizaje real</span>
          </h1>
          <p className="about-description">
            LearnYos nació con una idea simple pero poderosa: el estudio pasivo
            no funciona. Leer y subrayar no es suficiente. Para aprender de
            verdad necesitás <strong>practicar, equivocarte, recibir feedback y
            compartir</strong> con otros. Esa es la base del aprendizaje activo,
            y eso es exactamente lo que LearnYos hace posible con inteligencia
            artificial.
          </p>
        </div>
      </section>

      {/* What is LearnYos */}
      <section className="about-section">
        <div className="about-container">
          <h2 className="about-section-title">¿Qué es LearnYos?</h2>
          <p className="about-section-text">
            LearnYos es una <strong>plataforma de aprendizaje activo potenciada
            por inteligencia artificial</strong> que te permite crear exámenes
            online, flashcards compartidas y estudiar con un tutor IA personal
            llamado Junior. Es un espacio donde la comunidad comparte
            conocimiento y donde la tecnología te ayuda a retener información de
            forma más efectiva.
          </p>
          <p className="about-section-text">
            A diferencia de otras plataformas educativas, LearnYos no se limita
            a ofrecerte contenido preempaquetado. Vos creás, compartís,
            practicás y aprendés con otros. La IA actúa como tu asistente
            personal, generándote quizzes, notas de estudio y explicaciones
            personalizadas sobre cualquier tema.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="about-section about-section-alt">
        <div className="about-container">
          <h2 className="about-section-title">Funciones principales</h2>
          <div className="about-features-grid">
            {features.map((feature, i) => (
              <div key={i} className="about-feature-card">
                <div className="about-feature-icon">{feature.icon}</div>
                <h3 className="about-feature-title">{feature.title}</h3>
                <p className="about-feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="about-section">
        <div className="about-container">
          <h2 className="about-section-title">¿Cómo funciona LearnYos?</h2>
          <div className="about-steps">
            {steps.map((step) => (
              <div key={step.number} className="about-step">
                <span className="about-step-number">{step.number}</span>
                <div className="about-step-content">
                  <h3 className="about-step-title">{step.title}</h3>
                  <p className="about-step-text">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why LearnYos */}
      <section className="about-section about-section-alt">
        <div className="about-container">
          <h2 className="about-section-title">¿Por qué elegir LearnYos?</h2>
          <div className="about-benefits">
            {benefits.map((benefit, i) => (
              <div key={i} className="about-benefit">
                <span className="about-benefit-icon">{benefit.icon}</span>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-container">
          <h2 className="about-cta-title">Empezá a aprender hoy</h2>
          <p className="about-cta-text">
            Unite a la comunidad de estudiantes que ya están aprendiendo de
            forma más efectiva con LearnYos.
          </p>
          <Link href="/auth" className="about-cta-button">
            Comenzar gratis →
          </Link>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .about-page {
          min-height: 100vh;
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        .about-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .about-hero {
          padding: 6rem 0 4rem;
          text-align: center;
        }

        .about-tag {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          background-color: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .about-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .about-title-accent {
          color: hsl(var(--primary));
        }

        .about-description {
          font-size: 1.125rem;
          color: hsl(var(--muted-foreground));
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .about-description strong {
          color: hsl(var(--foreground));
        }

        .about-section {
          padding: 5rem 0;
        }

        .about-section-alt {
          background-color: hsl(var(--muted) / 0.3);
        }

        .about-section-title {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .about-section-text {
          font-size: 1.0625rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          max-width: 720px;
          margin-bottom: 1rem;
        }

        .about-section-text strong {
          color: hsl(var(--foreground));
        }

        .about-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 2.5rem;
        }

        .about-feature-card {
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          padding: 2rem;
          transition: all 0.2s ease;
        }

        .about-feature-card:hover {
          border-color: hsl(var(--primary) / 0.3);
          transform: translateY(-2px);
        }

        .about-feature-icon {
          font-size: 2rem;
          margin-bottom: 1.25rem;
        }

        .about-feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .about-feature-text {
          font-size: 0.9375rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.6;
        }

        .about-steps {
          margin-top: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .about-step {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .about-step-number {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .about-step-content {
          flex: 1;
        }

        .about-step-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .about-step-text {
          font-size: 1rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.6;
        }

        .about-benefits {
          margin-top: 2.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        .about-benefit {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .about-benefit-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .about-benefit h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .about-benefit p {
          font-size: 0.9375rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.6;
        }

        .about-cta {
          padding: 5rem 0;
          text-align: center;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .about-cta-title {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .about-cta-text {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .about-cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2.5rem;
          background: hsl(var(--background));
          color: hsl(var(--primary));
          font-weight: 700;
          font-size: 1.125rem;
          border-radius: 0.75rem;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .about-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .about-hero {
            padding: 4rem 0 3rem;
          }

          .about-section {
            padding: 3.5rem 0;
          }

          .about-features-grid {
            grid-template-columns: 1fr;
          }

          .about-benefits {
            grid-template-columns: 1fr;
          }

          .about-step {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}} />
    </main>
  );
}

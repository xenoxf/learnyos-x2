"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Mail,
  LogOut,
  Shield,
  FileText,
  Brain,
  CreditCard,
  Trash2,
  AlertTriangle,
  Globe,
  Lock,
  Database,
  Info,
  Sparkles,
  Coins,
  TrendingUp,
  Clock,
  Zap,
  BookOpen,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { CustomAlert } from "@/components/CustomAlert";
import styles from "@/styles/settings.module.css";
import { toast } from "@/hooks/useLocalToast";
import { Button } from "@/components/ui/button";

type TabType = "general" | "creditos" | "notes" | "flashcards" | "quizzes" | "terminos";

interface ManageItem {
  id: number;
  title: string;
  description?: string;
  acceso?: string;
  createdAt?: string;
  canDelete?: boolean;
}

interface CreditsStatus {
  remaining: number;
  total: number;
  used: number;
  percentageUsed: number;
  breakdown: {
    examGenerations: number;
    noteGenerations: number;
    flashcardGenerations: number;
    chatMessages: number;
  };
  costs: {
    EXAM_GENERATION: number;
    NOTE_GENERATION: number;
    FLASHCARD_GENERATION: number;
    CHAT_MESSAGE: number;
  };
  multipliers?: {
    EXAM_PER_QUESTION: number;
    EXAM_DIFFICULTY: { easy: number; medium: number; hard: number };
    NOTE_DETAIL: { breve: number; medio: number; detallado: number };
    FLASHCARD_PER_CARD: number;
    TOPIC_LENGTH_THRESHOLD: number;
  };
}

const DEFAULT_MULTIPLIERS = {
  EXAM_PER_QUESTION: 0.5,
  EXAM_DIFFICULTY: { easy: 1.0, medium: 1.3, hard: 1.7 },
  NOTE_DETAIL: { breve: 1.0, medio: 1.4, detallado: 1.9 },
  FLASHCARD_PER_CARD: 0.4,
  TOPIC_LENGTH_THRESHOLD: 100,
};

function calculateExamCost(numberOfQuestions: number, difficulty: string, topic: string, costs: CreditsStatus['costs'], multipliers?: CreditsStatus['multipliers']): number {
  const m = multipliers || DEFAULT_MULTIPLIERS;
  const base = costs.EXAM_GENERATION;
  const questionCost = numberOfQuestions * m.EXAM_PER_QUESTION;
  const difficultyMult = m.EXAM_DIFFICULTY[difficulty as keyof typeof m.EXAM_DIFFICULTY] || 1.3;
  const topicExtra = topic.length > m.TOPIC_LENGTH_THRESHOLD ? 1 : 0;
  return Math.ceil((base + questionCost) * difficultyMult + topicExtra);
}

function calculateNoteCost(levelOfDetail: string, topic: string, costs: CreditsStatus['costs'], multipliers?: CreditsStatus['multipliers']): number {
  const m = multipliers || DEFAULT_MULTIPLIERS;
  const base = costs.NOTE_GENERATION;
  const detailMult = m.NOTE_DETAIL[levelOfDetail as keyof typeof m.NOTE_DETAIL] || 1.4;
  const topicExtra = topic.length > m.TOPIC_LENGTH_THRESHOLD ? 1 : 0;
  return Math.ceil(base * detailMult + topicExtra);
}

function calculateFlashcardCost(numberOfCards: number, topic: string, costs: CreditsStatus['costs'], multipliers?: CreditsStatus['multipliers']): number {
  const m = multipliers || DEFAULT_MULTIPLIERS;
  const base = costs.FLASHCARD_GENERATION;
  const cardCost = numberOfCards * m.FLASHCARD_PER_CARD;
  const topicExtra = topic.length > m.TOPIC_LENGTH_THRESHOLD ? 1 : 0;
  return Math.ceil(base + cardCost + topicExtra);
}

export default function SettingsPage() {
  const router = useRouter();
  const { alert, alertState, handleClose, handleConfirm } = useCustomAlert();

  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [items, setItems] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<CreditsStatus | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Cargar datos de usuario
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // ignore
      }
    }
    setIsGuest(apiService.isGuest());
  }, []);

  // Cargar créditos
  const loadCredits = useCallback(async () => {
    try {
      setCreditsLoading(true);
      const status = await apiService.getCreditsStatus();
      setCredits(status);
    } catch (error) {
      console.error("Error loading credits:", error);
    } finally {
      setCreditsLoading(false);
    }
  }, []);

  // Cargar items de gestión
  const loadItems = useCallback(async () => {
    if (activeTab === "general" || activeTab === "creditos" || activeTab === "terminos") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let data: ManageItem[] = [];

      if (activeTab === "notes") {
        const notes = await apiService.getNotesPrivate();
        data = notes.map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          acceso:
            n.acceso === "public" || n.acceso === "publico"
              ? "public"
              : "private",
          createdAt: n.createdAt,
          canDelete: true,
        }));
      } else if (activeTab === "flashcards") {
        const cards = await apiService.getCardsPrivates();
        data = cards.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          createdAt: c.createdAt,
          canDelete: c.canDelete !== false,
        }));
      } else if (activeTab === "quizzes") {
        const quizzes = await apiService.getExamsPrivate();
        data = quizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          createdAt: q.createdAt,
          canDelete: q.canDelete !== false,
        }));
      }

      setItems(data);
    } catch (error) {
      toast.error('Error', 'No se pudieron cargar los elementos')
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Cargar créditos cuando se abre la pestaña
  useEffect(() => {
    if (activeTab === "creditos") {
      if (isGuest) return;
      loadCredits();
    }
  }, [activeTab, isGuest, loadCredits]);

  const handleDelete = async (id: number, title: string) => {
    const confirmed = await alert.show({
      title: "Eliminar elemento",
      message: `¿Estás seguro de eliminar "${title}"?`,
      type: "warning",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      showCancel: true,
    });

    if (!confirmed) return;

    try {
      setDeletingId(id);

      if (activeTab === "notes") {
        await apiService.deleteNote(id);
      } else if (activeTab === "flashcards") {
        await apiService.deleteCard(id);
      } else if (activeTab === "quizzes") {
        await apiService.deleteExam(id);
      }

      toast.success('Eliminado')

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error('Error', 'No se pudo eliminar')
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = await alert.show({
      title: "Eliminar todo",
      message: `¿Estás seguro de eliminar TODOS tus ${getSectionName()}?`,
      type: "warning",
      confirmText: "Eliminar todo",
      cancelText: "Cancelar",
      showCancel: true,
    });

    if (!confirmed) return;

    try {
      setDeletingAll(true);

      switch (activeTab) {
        case 'flashcards':
          await apiService.deleteAllCards();
          break;
        case 'notes':
          await apiService.deleteAllNotes();
          break;
        case 'quizzes':
          await apiService.deleteAllExams();
          break;
      }

      toast.success('Eliminados', 'Todo fue eliminado de forma correcta')

      router.refresh();
    } catch (error) {
      toast.error('Error', 'Error al eliminar los elementos')
    } finally {
      setDeletingAll(false);
    }
  };

  const getSectionName = () => {
    switch (activeTab) {
      case "notes":
        return "notas";
      case "flashcards":
        return "flashcards";
      case "quizzes":
        return "quizzes";
      default:
        return "elementos";
    }
  };

  const handleLogout = async () => {
    const confirmed = await alert.show({
      title: "Cerrar sesión",
      message: "¿Estás seguro de cerrar sesión?",
      type: "warning",
      confirmText: "Cerrar sesión",
      cancelText: "Cancelar",
      showCancel: true,
    });

    if (!confirmed) return;

    try {
      await apiService.logout();
      toast.success('Sesion cerrada', 'Has cerrado sesión correctamente.')
      router.push("/");
    } catch {
      toast.error('Error', 'No se pudo cerrar la sesión.')
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const menuItems = useMemo(() => [
    { id: "general" as TabType, label: "General", icon: Settings },
    { id: "creditos" as TabType, label: "Mis Créditos", icon: Coins },
    { id: "notes" as TabType, label: "Mis Notas", icon: FileText },
    { id: "flashcards" as TabType, label: "Mis Flashcards", icon: CreditCard },
    { id: "quizzes" as TabType, label: "Mis Quizzes", icon: Brain },
    { id: "terminos" as TabType, label: "Términos", icon: Shield },
  ], []);

  return (
    <div className={styles.container}>
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
      />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <Settings size={22} />
          </div>
          <h1 className={styles.title}>Configuración</h1>
        </div>
        <div className={styles.userInfo}>
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name || "Invitado"}
              width={32}
              height={32}
              className={styles.userAvatar}
            />
          ) : (
            <div className={styles.userAvatarPlaceholder}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <span className={styles.userName}>{user?.name || "Invitado"}</span>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <nav className={styles.navMenu}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ""}`}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className={styles.generalContent}>
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <User size={20} className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Información de Cuenta</h2>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>
                        <User size={16} />
                        <span>Nombre</span>
                      </div>
                      <p className={styles.infoValue}>
                        {user?.name || "No disponible"}
                      </p>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>
                        <Mail size={16} />
                        <span>Correo Electrónico</span>
                      </div>
                      <p className={styles.infoValue}>
                        {user?.email || "No disponible"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <LogOut size={20} className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Sesión</h2>
                </div>
                <div className={styles.cardBody}>
                  <button
                    className={styles.logoutButton}
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <Info size={20} className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Acerca de</h2>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.versionInfo}>
                    <span className={styles.versionLabel}>Versión</span>
                    <span className={styles.versionValue}>1.0.0</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* CREDITS TAB */}
          {activeTab === "creditos" && !isGuest ? (
            <div className={styles.creditsContent}>
              {/* Header de Créditos */}
              <section className={styles.creditsHero}>
                <div className={styles.creditsHeroIcon}>
                  <Sparkles size={32} />
                </div>
                <h2 className={styles.creditsHeroTitle}>
                  Tus Créditos Diarios
                </h2>
                <p className={styles.creditsHeroSubtitle}>
                  Los créditos se renuevan automáticamente cada día a medianoche
                </p>
              </section>

              {creditsLoading ? (
                <div className={styles.creditsLoading}>
                  <RefreshCw size={24} className={styles.spinner} />
                  <p>Cargando créditos...</p>
                </div>
              ) : credits ? (
                <>
                  {/* Tarjeta Principal de Créditos */}
                  <section className={styles.creditsMainCard}>
                    <div className={styles.creditsMainHeader}>
                      <div className={styles.creditsMainIcon}>
                        <Coins size={28} />
                      </div>
                      <div className={styles.creditsMainInfo}>
                        <span className={styles.creditsMainLabel}>
                          Créditos Disponibles
                        </span>
                        <div className={styles.creditsMainNumbers}>
                          <span className={styles.creditsRemaining}>
                            {credits.remaining}
                          </span>
                          <span className={styles.creditsSeparator}>/</span>
                          <span className={styles.creditsTotal}>
                            {credits.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className={styles.creditsProgressBar}>
                      <div
                        className={styles.creditsProgressFill}
                        style={{
                          width: `${Math.min(credits.percentageUsed, 100)}%`,
                        }}
                      />
                    </div>

                    {/* Porcentaje usado */}
                    <div className={styles.creditsPercentage}>
                      <TrendingUp size={16} />
                      <span>
                        {credits.percentageUsed}% usado hoy
                      </span>
                    </div>
                  </section>

                  {/* Costos por Acción */}
                  <section className={styles.creditsCostsCard}>
                    <div className={styles.creditsCostsHeader}>
                      <Zap size={20} className={styles.creditsCostsIcon} />
                      <h3 className={styles.creditsCostsTitle}>
                        Costo Base por Acción
                      </h3>
                    </div>
                    <p className={styles.creditsCostsNote}>
                      Los costos finales se calculan dinámicamente según cantidad, dificultad y longitud del tema.
                    </p>
                    <div className={styles.creditsCostsGrid}>
                      <div className={styles.creditsCostItem}>
                        <div className={styles.creditsCostIcon}>
                          <BookOpen size={18} />
                        </div>
                        <div className={styles.creditsCostInfo}>
                          <span className={styles.creditsCostName}>
                            Generar Quiz
                          </span>
                          <span className={styles.creditsCostValue}>
                            Desde {credits.costs.EXAM_GENERATION} créditos
                          </span>
                        </div>
                      </div>
                      <div className={styles.creditsCostItem}>
                        <div className={styles.creditsCostIcon}>
                          <FileText size={18} />
                        </div>
                        <div className={styles.creditsCostInfo}>
                          <span className={styles.creditsCostName}>
                            Generar Notas
                          </span>
                          <span className={styles.creditsCostValue}>
                            Desde {credits.costs.NOTE_GENERATION} créditos
                          </span>
                        </div>
                      </div>
                      <div className={styles.creditsCostItem}>
                        <div className={styles.creditsCostIcon}>
                          <CreditCard size={18} />
                        </div>
                        <div className={styles.creditsCostInfo}>
                          <span className={styles.creditsCostName}>
                            Generar Flashcards
                          </span>
                          <span className={styles.creditsCostValue}>
                            Desde {credits.costs.FLASHCARD_GENERATION} créditos
                          </span>
                        </div>
                      </div>
                      <div className={styles.creditsCostItem}>
                        <div className={styles.creditsCostIcon}>
                          <MessageSquare size={18} />
                        </div>
                        <div className={styles.creditsCostInfo}>
                          <span className={styles.creditsCostName}>
                            Mensaje de Chat
                          </span>
                          <span className={styles.creditsCostValue}>
                            {credits.costs.CHAT_MESSAGE} crédito
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Desglose de Uso */}
                  <section className={styles.creditsBreakdownCard}>
                    <div className={styles.creditsBreakdownHeader}>
                      <Clock size={20} className={styles.creditsBreakdownIcon} />
                      <h3 className={styles.creditsBreakdownTitle}>
                        Uso de Hoy
                      </h3>
                    </div>
                    <div className={styles.creditsBreakdownGrid}>
                      <div className={styles.creditsBreakdownItem}>
                        <div className={styles.creditsBreakdownIconWrapper}>
                          <BookOpen size={16} />
                        </div>
                        <div className={styles.creditsBreakdownInfo}>
                          <span className={styles.creditsBreakdownName}>
                            Quizzes Generados
                          </span>
                          <span className={styles.creditsBreakdownValue}>
                            {credits.breakdown.examGenerations}
                          </span>
                        </div>
                      </div>
                      <div className={styles.creditsBreakdownItem}>
                        <div className={styles.creditsBreakdownIconWrapper}>
                          <FileText size={16} />
                        </div>
                        <div className={styles.creditsBreakdownInfo}>
                          <span className={styles.creditsBreakdownName}>
                            Notas Generadas
                          </span>
                          <span className={styles.creditsBreakdownValue}>
                            {credits.breakdown.noteGenerations}
                          </span>
                        </div>
                      </div>
                      <div className={styles.creditsBreakdownItem}>
                        <div className={styles.creditsBreakdownIconWrapper}>
                          <CreditCard size={16} />
                        </div>
                        <div className={styles.creditsBreakdownInfo}>
                          <span className={styles.creditsBreakdownName}>
                            Flashcards Generadas
                          </span>
                          <span className={styles.creditsBreakdownValue}>
                            {credits.breakdown.flashcardGenerations}
                          </span>
                        </div>
                      </div>
                      <div className={styles.creditsBreakdownItem}>
                        <div className={styles.creditsBreakdownIconWrapper}>
                          <MessageSquare size={16} />
                        </div>
                        <div className={styles.creditsBreakdownInfo}>
                          <span className={styles.creditsBreakdownName}>
                            Mensajes de Chat
                          </span>
                          <span className={styles.creditsBreakdownValue}>
                            {credits.breakdown.chatMessages}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Nota Informativa */}
                  <section className={styles.creditsInfoCard}>
                    <Info size={18} />
                    <p>
                      Los créditos son gratuitos y se renuevan automáticamente cada
                      día a las 00:00 (hora local). No son acumulables entre días.
                      El costo real de cada acción se calcula dinámicamente según
                      cantidad, dificultad y longitud del tema.
                    </p>
                  </section>
                </>
              ) : (
                (<div className={styles.creditsError}>
                  <AlertTriangle size={32} />
                  <p>No se pudieron cargar los créditos</p>
                  <button
                    className={styles.creditsRetryButton}
                    onClick={loadCredits}
                    type="button"
                  >
                    <RefreshCw size={16} />
                    <span>Reintentar</span>
                  </button>
                </div>)

              )}
            </div>
          ) : (
            <div className={styles.guestMessage}>
              <AlertTriangle size={32} />
              <h3>Funcionalidad restringida</h3>
              <p>Inicia sesión para acceder a tus créditos y gestionar tu contenido.</p>
              <Button
                className={styles.guestActionBtn}
                onClick={() => { apiService.logout(); router.push('/auth'); }}
              >
                <LogOut size={16} />
                <span>Iniciar sesión</span>
              </Button>
            </div>
          )}

          {/* TERMS TAB */}
          {activeTab === "terminos" && (
            <div className={styles.termsContent}>
              <div className={styles.termsHeader}>
                <h2 className={styles.termsTitle}>Términos y Condiciones</h2>
                <p className={styles.termsDate}>
                  Última actualización: 5 de abril de 2026
                </p>
              </div>

              <div className={styles.termsBody}>
                <section className={styles.termsSection}>
                  <h3>1. Aceptación de los Términos</h3>
                  <p>
                    Al acceder y utilizar LearnYos, aceptas estar vinculado por estos Términos y Condiciones.
                    Si no estás de acuerdo, no utilices la plataforma.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>2. Descripción del Servicio</h3>
                  <p>
                    LearnYos es una plataforma educativa impulsada por inteligencia artificial que permite
                    crear, gestionar y estudiar contenido educativo: quizzes tipo ICFES, notas de estudio,
                    flashcards y chat educativo con tutor IA.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>3. Sistema de Créditos</h3>
                  <p>
                    La plataforma utiliza un sistema de créditos diarios para el uso de las funcionalidades de IA.
                    Cada usuario registrado recibe créditos gratuitos cada día, los cuales se renuevan automáticamente
                    a medianoche (hora local) y no son acumulables entre días.
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>
                    El costo de cada acción se calcula dinámicamente en función de:
                  </p>
                  <ul className={styles.termsList}>
                    <li><strong>Quizzes:</strong> costo base + adicional por cada pregunta + multiplicador por nivel de dificultad</li>
                    <li><strong>Notas:</strong> costo base + multiplicador por nivel de detalle (breve, medio, detallado)</li>
                    <li><strong>Flashcards:</strong> costo base + adicional por cada tarjeta generada</li>
                    <li><strong>Chat:</strong> costo fijo por mensaje</li>
                  </ul>
                  <p style={{ marginTop: '0.5rem' }}>
                    Los valores exactos pueden variar y se muestran en tiempo real en la sección de configuración.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>4. Cuenta de Usuario</h3>
                  <p>
                    Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades
                    que ocurran bajo ella. Debes notificar inmediatamente cualquier uso no autorizado.
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>
                    Los usuarios invitados (guest) tienen acceso limitado a la plataforma y no pueden
                    generar contenido ni gestionar datos personales.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>5. Contenido Generado por IA</h3>
                  <p>
                    El contenido generado por inteligencia artificial es orientativo y debe ser verificado
                    por el usuario. LearnYos no garantiza la exactitud, completitud o idoneidad del contenido
                    generado por IA para fines académicos específicos.
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>
                    Eres responsable del uso que haces del contenido generado y de verificar su precisión
                    antes de utilizarlo en contextos académicos formales.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>6. Privacidad y Datos</h3>
                  <p>
                    Los datos personales se tratan conforme a nuestra Política de Privacidad. El contenido
                    privado (notas, flashcards, quizzes) solo es visible para su creador, salvo que el
                    usuario decida hacerlo público explícitamente.
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>
                    Los datos de uso de IA (prompts y respuestas) se almacenan temporalmente para proporcionar
                    contexto en conversaciones continuas y pueden ser utilizados para mejorar el servicio.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>7. Uso Aceptable</h3>
                  <p>No está permitido:</p>
                  <ul className={styles.termsList}>
                    <li>Generar contenido ilegal, ofensivo o que viole derechos de terceros</li>
                    <li>Violar derechos de propiedad intelectual o derechos de autor</li>
                    <li>Interferir con el funcionamiento técnico de la plataforma</li>
                    <li>Intentar acceder a cuentas o contenido de otros usuarios</li>
                    <li>Utilizar la plataforma para fines distintos a los educativos</li>
                    <li>Eludir los límites de créditos o restricciones técnicas</li>
                  </ul>
                </section>

                <section className={styles.termsSection}>
                  <h3>8. Propiedad Intelectual</h3>
                  <p>
                    La plataforma LearnYos, su código fuente, diseño y contenido original son propiedad
                    de LearnYos y están protegidos por leyes de derechos de autor y propiedad intelectual.
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>
                    El contenido que generes utilizando la plataforma es de tu propiedad. Sin embargo,
                    concedemos a LearnYos una licencia no exclusiva para almacenar, procesar y mostrar
                    dicho contenido dentro de la plataforma.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>9. Limitación de Responsabilidad</h3>
                  <p>
                    LearnYos se proporciona &quot;tal cual&quot; sin garantías de ningún tipo. No nos hacemos
                    responsables de daños directos, indirectos, incidentales o consecuentes derivados del uso
                    de la plataforma, incluyendo pero no limitándose a errores en el contenido generado por IA,
                    interrupciones del servicio o pérdida de datos.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>10. Servicios de Terceros</h3>
                  <p>
                    LearnYos utiliza servicios de terceros para su funcionamiento, incluyendo pero no limitándose
                    a proveedores de inteligencia artificial (Groq), autenticación (Google OAuth) y hosting.
                    El uso de estos servicios está sujeto a sus propios términos y condiciones.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>11. Modificaciones</h3>
                  <p>
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
                    entran en vigor inmediatamente tras su publicación en la plataforma. El uso continuado
                    de LearnYos después de cualquier modificación constituye tu aceptación de los nuevos términos.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>12. Ley Aplicable</h3>
                  <p>
                    Estos términos se rigen por las leyes de Colombia. Cualquier disputa relacionada con
                    estos términos se resolverá ante los tribunales competentes de Colombia.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>13. Contacto</h3>
                  <p>
                    Para preguntas sobre estos términos o el servicio, puedes contactarnos a través de
                    los canales oficiales de LearnYos.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* NOTES / FLASHCARDS / QUIZZES TABS */}
          {(activeTab === "notes" || activeTab === "flashcards" || activeTab === "quizzes") && !isGuest ? (
            <div className={styles.manageContent}>
              <div className={styles.manageHeader}>
                <div className={styles.manageHeaderLeft}>
                  <Database size={20} className={styles.manageIcon} />
                  <h2 className={styles.manageTitle}>
                    Gestionar {activeTab === "notes" ? "Notas" : activeTab === "flashcards" ? "Flashcards" : "Quizzes"}
                  </h2>
                </div>
                {items.filter((item) => item.canDelete !== false).length > 0 && (
                  <button
                    className={styles.deleteAllButton}
                    onClick={handleDeleteAll}
                    disabled={deletingAll}
                    type="button"
                  >
                    <AlertTriangle size={16} />
                    <span>{deletingAll ? "Eliminando..." : `Eliminar Todo (${items.filter((item) => item.canDelete !== false).length})`}</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                  <p>Cargando elementos...</p>
                </div>
              ) : items.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    {activeTab === "notes" ? <FileText size={40} /> : activeTab === "flashcards" ? <CreditCard size={40} /> : <Brain size={40} />}
                  </div>
                  <p className={styles.emptyText}>No tienes elementos para mostrar</p>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                      <div className={styles.listItemContent}>
                        <div className={styles.listItemHeader}>
                          <h3 className={styles.listItemTitle}>{item.title}</h3>
                          {item.acceso && (
                            <span className={`${styles.accessBadge} ${item.acceso === "public" ? styles.accessPublic : styles.accessPrivate}`}>
                              {item.acceso === "public" ? (
                                <>
                                  <Globe size={12} /> Público
                                </>
                              ) : (
                                <>
                                  <Lock size={12} /> Privado
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className={styles.listItemDescription}>{item.description}</p>
                        )}
                        {item.createdAt && (
                          <span className={styles.listItemDate}>Creado: {formatDate(item.createdAt)}</span>
                        )}
                      </div>
                      {item.canDelete !== false && (
                        <button
                          className={`${styles.deleteButton} ${deletingId === item.id ? styles.deleting : ""}`}
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          type="button"
                          aria-label={`Eliminar ${item.title}`}
                        >
                          {deletingId === item.id ? (
                            <span className={styles.deleteSpinner} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.guestMessage}>
              <AlertTriangle size={32} />
              <h3>Funcionalidad restringida</h3>
              <p>Inicia sesión para gestionar tu contenido privado.</p>
              <Button
                className={styles.guestActionBtn}
                onClick={() => { apiService.logout(); router.push('/auth'); }}
              >
                <LogOut size={16} />
                <span>Iniciar sesión</span>
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

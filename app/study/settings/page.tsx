"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Settings,
  ArrowLeft,
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
  Bell,
  Palette,
  Database,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { CustomAlert } from "@/components/CustomAlert";
import { ThemeToggle } from "@/components/ThemeToggle";
import styles from "@/styles/settings.module.css";

type TabType = "general" | "notes" | "flashcards" | "quizzes" | "terms";

interface ManageItem {
  id: number;
  title: string;
  description?: string;
  acceso?: string;
  createdAt?: string;
  canDelete?: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { alert, alertState, handleClose, handleConfirm } = useCustomAlert();

  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [items, setItems] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // ignore
      }
    }
  }, []);

  const loadItems = useCallback(async () => {
    if (activeTab === "general" || activeTab === "terms") {
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los elementos",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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

      toast({
        title: "Eliminado",
        description: "Elemento eliminado correctamente",
      });

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el elemento",
      });
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
      let deletedCount = 0;
      const itemsToDelete = [...items];

      for (const item of itemsToDelete) {
        if (item.canDelete === false) continue;

        try {
          if (activeTab === "notes") {
            await apiService.deleteNote(item.id);
          } else if (activeTab === "flashcards") {
            await apiService.deleteCard(item.id);
          } else if (activeTab === "quizzes") {
            await apiService.deleteExam(item.id);
          }
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting ${item.id}:`, error);
        }
      }

      toast({
        title: "Eliminados",
        description: `${deletedCount} de ${items.length} elementos eliminados`,
      });

      setItems((prev) => prev.filter((item) => item.canDelete === false));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar los elementos",
      });
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
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push("/auth");
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión.",
      });
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
    { id: "notes" as TabType, label: "Mis Notas", icon: FileText },
    { id: "flashcards" as TabType, label: "Mis Flashcards", icon: CreditCard },
    { id: "quizzes" as TabType, label: "Mis Quizzes", icon: Brain },
    { id: "terms" as TabType, label: "Términos", icon: Shield },
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
          <button
            onClick={() => router.back()}
            className={styles.backBtn}
            type="button"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.headerIcon}>
            <Settings size={22} />
          </div>
          <h1 className={styles.title}>Configuración</h1>
        </div>
        <div className={styles.userInfo}>
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name || "Usuario"}
              width={32}
              height={32}
              className={styles.userAvatar}
            />
          ) : (
            <div className={styles.userAvatarPlaceholder}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <span className={styles.userName}>{user?.name || "Usuario"}</span>
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

          {activeTab === "terms" && (
            <div className={styles.termsContent}>
              <div className={styles.termsHeader}>
                <Shield size={28} className={styles.termsIcon} />
                <h2 className={styles.termsTitle}>Términos y Condiciones</h2>
                <p className={styles.termsDate}>
                  Última actualización: 30 de marzo del 2026                </p>
              </div>

              <div className={styles.termsBody}>
                <section className={styles.termsSection}>
                  <h3>1. Aceptación de los Términos</h3>
                  <p>
                    Al acceder y utilizar LearnyOS, aceptas estar legalmente
                    vinculado por estos Términos y Condiciones de Uso.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>2. Descripción del Servicio</h3>
                  <p>
                    LearnyOS es una plataforma educativa impulsada por IA que
                    proporciona herramientas para creación y gestión de contenido educativo.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>3. Cuenta de Usuario</h3>
                  <p>
                    Eres responsable de mantener la confidencialidad de tu cuenta
                    y de todas las actividades que ocurran bajo ella.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>4. Contenido Generado</h3>
                  <p>
                    Eres responsable del contenido que creas. El contenido generado
                    por IA debe ser verificado por el usuario.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>5. Privacidad</h3>
                  <p>
                    Los datos personales son tratados conforme a nuestra Política
                    de Privacidad. El contenido privado solo es visible para ti.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>6. Uso Aceptable</h3>
                  <ul className={styles.termsList}>
                    <li>No generar contenido ilegal u ofensivo</li>
                    <li>No violar derechos de propiedad intelectual</li>
                    <li>No interferir con el funcionamiento de la plataforma</li>
                    <li>No intentar acceder a cuentas de otros usuarios</li>
                  </ul>
                </section>

                <section className={styles.termsSection}>
                  <h3>7. Propiedad Intelectual</h3>
                  <p>
                    La plataforma y su contenido original son propiedad de LearnyOS
                    y están protegidos por leyes de derechos de autor.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>8. Limitación de Responsabilidad</h3>
                  <p>
                    LearnyOS se proporciona &quot;tal cual&quot; sin garantías.
                    No nos hacemos responsables de daños derivados del uso.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>9. Modificaciones</h3>
                  <p>
                    Nos reservamos el derecho de modificar estos términos en
                    cualquier momento. Los cambios entran en vigor inmediatamente.
                  </p>
                </section>

                <section className={styles.termsSection}>
                  <h3>10. Ley Aplicable</h3>
                  <p>
                    Estos términos se rigen por las leyes de Colombia.
                  </p>
                </section>
              </div>
            </div>
          )}

          {(activeTab === "notes" || activeTab === "flashcards" || activeTab === "quizzes") && (
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
          )}
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { X, Trash2, Lock, Globe, User, FileText, LogOut, Shield, AlertTriangle, Settings, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { useRouter } from "next/navigation";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { CustomAlert } from "@/components/CustomAlert";
import styles from "@/styles/settingsPage.module.css";

type TabType = "general" | "notes" | "cards" | "quizzes" | "terms";

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
          acceso: n.acceso === "public" || n.acceso === "publico" ? "public" : "private",
          canDelete: true,
        }));
      } else if (activeTab === "cards") {
        const cards = await apiService.getCardsPrivates();
        data = cards.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          canDelete: c.canDelete,
        }));
      } else if (activeTab === "quizzes") {
        const quizzes = await apiService.getExamsPrivate();
        data = quizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          canDelete: q.canDelete,
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
      message: `¿Estás seguro de eliminar "${title}"? Esta acción no se puede deshacer.`,
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
      } else if (activeTab === "cards") {
        await apiService.deleteCard(id);
      } else if (activeTab === "quizzes") {
        await apiService.deleteExam(id);
      }

      toast({
        title: "Eliminado",
        description: "El elemento ha sido eliminado correctamente",
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
      message: `¿Estás seguro de eliminar TODOS tus ${getSectionName()}? Esta acción no se puede deshacer y eliminará permanentemente todos los elementos.`,
      type: "warning",
      confirmText: "Eliminar todo",
      cancelText: "Cancelar",
      showCancel: true,
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      let deletedCount = 0;

      for (const item of items) {
        try {
          if (activeTab === "notes") {
            await apiService.deleteNote(item.id);
          } else if (activeTab === "cards") {
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
        description: `Se eliminaron ${deletedCount} de ${items.length} elementos`,
      });

      setItems([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar los elementos",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSectionName = () => {
    switch (activeTab) {
      case "notes":
        return "notas";
      case "cards":
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
      message: "¿Estás seguro de que deseas cerrar sesión?",
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
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const tabs = [
    { id: "general" as TabType, label: "General", icon: Settings },
    { id: "notes" as TabType, label: "Mis Notas", icon: FileText },
    { id: "cards" as TabType, label: "Mis Flashcards", icon: User },
    { id: "quizzes" as TabType, label: "Mis Quizzes", icon: User },
    { id: "terms" as TabType, label: "Términos", icon: Shield },
  ];

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
        <div className={styles.headerLeft}>
          <button onClick={() => router.back()} className={styles.backBtn} type="button" aria-label="Volver">
            <ArrowLeft size={24} />
          </button>
          <div className={styles.headerIcon}>
            <Settings size={28} />
          </div>
          <h1 className={styles.title}>Configuración</h1>
        </div>
        <div className={styles.userInfo}>
          {user?.picture ? (
            <img src={user.picture} alt={user.name || "User"} className={styles.userAvatar} />
          ) : (
            <div className={styles.userAvatarPlaceholder}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <span className={styles.userName}>{user?.name || "Usuario"}</span>
        </div>
      </header>

      <div className={styles.content}>
        {/* Tabs Navigation */}
        <nav className={styles.tabsNav}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === "general" && (
            <div className={styles.generalTab}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Cuenta</h2>
                <div className={styles.sectionContent}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <strong className={styles.settingLabel}>Nombre</strong>
                      <span className={styles.settingValue}>{user?.name || "No disponible"}</span>
                    </div>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <strong className={styles.settingLabel}>Email</strong>
                      <span className={styles.settingValue}>{user?.email || "No disponible"}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Acciones</h2>
                <div className={styles.sectionContent}>
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Legal</h2>
                <div className={styles.sectionContent}>
                  <a
                    href="/terms.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                  >
                    <Shield size={20} />
                    <span>Ver Términos y Condiciones</span>
                  </a>
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Acerca de</h2>
                <div className={styles.sectionContent}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <strong className={styles.settingLabel}>Versión</strong>
                      <span className={styles.settingValue}>1.0.0</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "terms" && (
            <div className={styles.termsTab}>
              <div className={styles.termsContent}>
                <h2 className={styles.termsTitle}>Términos y Condiciones de Uso</h2>
                <p className={styles.termsSubtitle}>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>
                
                <div className={styles.termsBody}>
                  <section>
                    <h3>1. Aceptación de los Términos</h3>
                    <p>
                      Al acceder y utilizar LearnyOS, aceptas estar legalmente vinculado por estos Términos y Condiciones de Uso. 
                      Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices nuestra plataforma.
                    </p>
                  </section>

                  <section>
                    <h3>2. Descripción del Servicio</h3>
                    <p>
                      LearnyOS es una plataforma educativa impulsada por inteligencia artificial que proporciona herramientas 
                      para la creación y gestión de contenido educativo, incluyendo quizzes, flashcards y notas de estudio.
                    </p>
                  </section>

                  <section>
                    <h3>3. Cuenta de Usuario</h3>
                    <p>
                      Para acceder a ciertas funcionalidades, debes crear una cuenta. Eres responsable de mantener la 
                      confidencialidad de tu cuenta y de todas las actividades que ocurran bajo tu cuenta.
                    </p>
                  </section>

                  <section>
                    <h3>4. Contenido Generado</h3>
                    <p>
                      Eres responsable del contenido que creas en la plataforma. El contenido generado por IA es una 
                      herramienta de apoyo y debe ser verificado por el usuario.
                    </p>
                  </section>

                  <section>
                    <h3>5. Privacidad</h3>
                    <p>
                      Tu privacidad es importante para nosotros. Los datos personales son tratados conforme a nuestra 
                      Política de Privacidad. El contenido privado solo es visible para ti, a menos que decidas hacerlo público.
                    </p>
                  </section>

                  <section>
                    <h3>6. Uso Aceptable</h3>
                    <p>
                      Te comprometes a no utilizar la plataforma para:
                    </p>
                    <ul>
                      <li>Generar contenido ilegal, ofensivo o dañino</li>
                      <li>Violar derechos de propiedad intelectual</li>
                      <li>Interferir con el funcionamiento de la plataforma</li>
                      <li>Intentar acceder a cuentas de otros usuarios</li>
                    </ul>
                  </section>

                  <section>
                    <h3>7. Propiedad Intelectual</h3>
                    <p>
                      La plataforma y su contenido original (excluyendo el contenido generado por usuarios) son propiedad 
                      de LearnyOS y están protegidos por leyes de derechos de autor.
                    </p>
                  </section>

                  <section>
                    <h3>8. Limitación de Responsabilidad</h3>
                    <p>
                      LearnyOS se proporciona &quot;tal cual&quot; sin garantías de ningún tipo. No nos hacemos responsables de 
                      daños directos, indirectos o consecuentes derivados del uso de la plataforma.
                    </p>
                  </section>

                  <section>
                    <h3>9. Modificaciones</h3>
                    <p>
                      Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán 
                      en vigor inmediatamente después de su publicación en la plataforma.
                    </p>
                  </section>

                  <section>
                    <h3>10. Terminación</h3>
                    <p>
                      Podemos suspender o terminar tu acceso a la plataforma por cualquier motivo, incluyendo violaciones 
                      de estos términos, sin previo aviso.
                    </p>
                  </section>

                  <section>
                    <h3>11. Ley Aplicable</h3>
                    <p>
                      Estos términos se rigen por las leyes de Colombia. Cualquier disputa relacionada con estos términos 
                      se someterá a la jurisdicción exclusiva de los tribunales de Colombia.
                    </p>
                  </section>

                  <section>
                    <h3>12. Contacto</h3>
                    <p>
                      Para preguntas sobre estos Términos y Condiciones, puedes contactarnos a través de la plataforma.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className={styles.manageTab}>
              <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Gestionar notas</h2>
                {items.length > 0 && (
                  <button
                    className={styles.deleteAllBtn}
                    onClick={handleDeleteAll}
                    type="button"
                  >
                    <AlertTriangle size={18} />
                    <span>Eliminar todo ({items.length})</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <p>Cargando notas...</p>
                </div>
              ) : items.length === 0 ? (
                <div className={styles.empty}>
                  <p>No tienes notas para mostrar</p>
                </div>
              ) : (
                <div className={styles.list}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                      <div className={styles.listItemContent}>
                        <div className={styles.listItemHeader}>
                          <h3 className={styles.listItemTitle}>{item.title}</h3>
                          {item.acceso && (
                            <span
                              className={`${styles.accessBadge} ${
                                item.acceso === "public"
                                  ? styles.accessPublic
                                  : styles.accessPrivate
                              }`}
                            >
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
                          <span className={styles.listItemDate}>
                            Creado: {formatDate(item.createdAt)}
                          </span>
                        )}
                      </div>
                      <button
                        className={`${styles.deleteBtn} ${deletingId === item.id ? styles.deleting : ""}`}
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deletingId === item.id}
                        type="button"
                        aria-label={`Eliminar ${item.title}`}
                      >
                        {deletingId === item.id ? (
                          <span className={styles.deleteSpinner} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "cards" && (
            <div className={styles.manageTab}>
              <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Gestionar flashcards</h2>
                {items.length > 0 && (
                  <button
                    className={styles.deleteAllBtn}
                    onClick={handleDeleteAll}
                    type="button"
                  >
                    <AlertTriangle size={18} />
                    <span>Eliminar todo ({items.length})</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <p>Cargando flashcards...</p>
                </div>
              ) : items.length === 0 ? (
                <div className={styles.empty}>
                  <p>No tienes flashcards para mostrar</p>
                </div>
              ) : (
                <div className={styles.list}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                      <div className={styles.listItemContent}>
                        <div className={styles.listItemHeader}>
                          <h3 className={styles.listItemTitle}>{item.title}</h3>
                          {item.description && (
                            <p className={styles.listItemDescription}>{item.description}</p>
                          )}
                        </div>
                        <button
                          className={`${styles.deleteBtn} ${deletingId === item.id ? styles.deleting : ""}`}
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          type="button"
                          aria-label={`Eliminar ${item.title}`}
                        >
                          {deletingId === item.id ? (
                            <span className={styles.deleteSpinner} />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className={styles.manageTab}>
              <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Gestionar quizzes</h2>
                {items.length > 0 && (
                  <button
                    className={styles.deleteAllBtn}
                    onClick={handleDeleteAll}
                    type="button"
                  >
                    <AlertTriangle size={18} />
                    <span>Eliminar todo ({items.length})</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <p>Cargando quizzes...</p>
                </div>
              ) : items.length === 0 ? (
                <div className={styles.empty}>
                  <p>No tienes quizzes para mostrar</p>
                </div>
              ) : (
                <div className={styles.list}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                      <div className={styles.listItemContent}>
                        <div className={styles.listItemHeader}>
                          <h3 className={styles.listItemTitle}>{item.title}</h3>
                          {item.description && (
                            <p className={styles.listItemDescription}>{item.description}</p>
                          )}
                        </div>
                        <button
                          className={`${styles.deleteBtn} ${deletingId === item.id ? styles.deleting : ""}`}
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          type="button"
                          aria-label={`Eliminar ${item.title}`}
                        >
                          {deletingId === item.id ? (
                            <span className={styles.deleteSpinner} />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

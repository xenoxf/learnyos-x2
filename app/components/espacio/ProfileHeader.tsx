import React from "react";
import Image from "next/image";
import { Info } from "lucide-react";
import styles from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
  user: {
    name?: string;
    email?: string;
    picture?: string;
    isGuest?: boolean;
  } | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const initial = user?.name?.[0]?.toUpperCase() || "U";
  const isGuest = user?.isGuest === true;

  return (
    <header className={styles.header}>
      <div className={styles.avatarWrapper}>
        {user?.picture ? (
          <Image
            src={user.picture}
            alt={user.name || "Usuario"}
            className={styles.avatar}
            width={80}
            height={80}
            unoptimized
          />
        ) : (
          <div className={styles.avatarPlaceholder}>{initial}</div>
        )}
        {!isGuest && (
          <div className={styles.badge} title="Cuenta Verificada">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
        )}
      </div>
      <div className={styles.details}>
        <h1 className={styles.name}>{user?.name || "Usuario"}</h1>
        <p className={styles.email}>{user?.email || "Sin correo electrónico"}</p>
        {isGuest && (
          <div className={styles.guestBadge}>
            <Info size={12} />
            <span>Modo Invitado</span>
          </div>
        )}
      </div>
    </header>
  );
};

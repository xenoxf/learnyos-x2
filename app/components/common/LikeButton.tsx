"use client";

import React, { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { isGuestUser } from "@/lib/auth-utils";
import { likesService } from "@/services/likesService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import styles from "./LikeButton.module.css";
import { errorHandler } from "@/services/errorHandler";

interface LikeButtonProps {
  id: number;
  type: "note" | "flashcard" | "exam";
  initialLikes?: number;
  initialLiked?: boolean;
  isOwner?: boolean;
  className?: string;
  showCount?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  id,
  type,
  initialLikes = 0,
  initialLiked = false,
  isOwner = false,
  className = "",
  showCount = true,
}) => {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(initialLiked);
  const [isLiking, setIsLiking] = useState(false);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLiking || isOwner) return;

      if (isGuestUser()) {
        setShowGuestAlert(true);
        return;
      }

      try {
        setIsLiking(true);
        let result;
        if (type === "note") {
          result = await likesService.toggleNoteLike(id);
        } else if (type === "flashcard") {
          result = await likesService.toggleFlashcardLike(id);
        } else {
          result = await likesService.toggleExamLike(id);
        }
        setLikesCount(result.count);
        setUserLiked(result.liked);
      } catch (error) {
        errorHandler(error, "Error toggling like");
      } finally {
        setIsLiking(false);
      }
    },
    [id, type, isLiking, isOwner],
  );

  if (isOwner) {
    return (
      <div className={`${styles.likesCountOnly} ${className}`}>
        <Heart size={14} fill="currentColor" />
        {showCount && <span>{likesCount}</span>}
      </div>
    );
  }

  return (
    <>
      <button
        className={`${styles.likeBtn} ${userLiked ? styles.likeBtnActive : ""} ${className}`}
        onClick={handleLike}
        disabled={isLiking}
        type="button"
        title={userLiked ? "Quitar me gusta" : "Me gusta"}
      >
        <Heart
          size={15}
          fill={userLiked ? "currentColor" : "none"}
          className={isLiking ? styles.likeAnimating : ""}
        />
        {showCount && likesCount > 0 && <span>{likesCount}</span>}
      </button>

      <AlertDialog open={showGuestAlert} onOpenChange={setShowGuestAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inicia sesión para dar Me gusta</AlertDialogTitle>
            <AlertDialogDescription>
              Los usuarios invitados no pueden dar Me gusta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/auth")}>
              Ir a Iniciar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

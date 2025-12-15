import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

/**
 * ============================================
 * BUTTON COMPONENT
 * ============================================
 * 
 * Componente de botón con variantes y tamaños.
 * Convertido de Tailwind a CSS puro.
 * 
 * Variantes:
 * - default: Botón primario
 * - destructive: Botón de acción destructiva
 * - outline: Botón con borde
 * - secondary: Botón secundario
 * - ghost: Botón sin fondo
 * - link: Botón estilo enlace
 * 
 * Tamaños:
 * - default: Altura estándar
 * - sm: Pequeño
 * - lg: Grande
 * - icon: Solo icono
 */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <>
        <Comp
          className={cn("btn", `btn-${variant}`, `btn-${size}`, className)}
          ref={ref}
          {...props}
        />
        <style jsx global>{`
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            white-space: nowrap;
            border-radius: calc(var(--radius) - 2px);
            font-size: 0.875rem;
            font-weight: 500;
            transition: all var(--transition-base);
            border: none;
            cursor: pointer;
            outline: none;
          }

          .btn:focus-visible {
            outline: 2px solid transparent;
            outline-offset: 2px;
            box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring));
          }

          .btn:disabled {
            pointer-events: none;
            opacity: 0.5;
          }

          .btn svg {
            pointer-events: none;
            width: 1rem;
            height: 1rem;
            flex-shrink: 0;
          }

          /* Variantes */
          .btn-default {
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
          }

          .btn-default:hover:not(:disabled) {
            background-color: hsl(var(--primary) / 0.9);
          }

          .btn-destructive {
            background-color: hsl(var(--destructive));
            color: hsl(var(--destructive-foreground));
          }

          .btn-destructive:hover:not(:disabled) {
            background-color: hsl(var(--destructive) / 0.9);
          }

          .btn-outline {
            border: 1px solid hsl(var(--input));
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
          }

          .btn-outline:hover:not(:disabled) {
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
          }

          .btn-secondary {
            background-color: hsl(var(--secondary));
            color: hsl(var(--secondary-foreground));
          }

          .btn-secondary:hover:not(:disabled) {
            background-color: hsl(var(--secondary) / 0.8);
          }

          .btn-ghost {
            background-color: transparent;
            color: hsl(var(--foreground));
          }

          .btn-ghost:hover:not(:disabled) {
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
          }

          .btn-link {
            background-color: transparent;
            color: hsl(var(--primary));
            text-decoration: underline;
            text-underline-offset: 4px;
          }

          .btn-link:hover:not(:disabled) {
            text-decoration: underline;
          }

          /* Tamaños */
          .btn-default {
            height: 2.5rem;
            padding: 0.5rem 1rem;
          }

          .btn-sm {
            height: 2.25rem;
            border-radius: calc(var(--radius) - 2px);
            padding: 0 0.75rem;
          }

          .btn-lg {
            height: 2.75rem;
            border-radius: calc(var(--radius) - 2px);
            padding: 0 2rem;
          }

          .btn-icon {
            height: 2.5rem;
            width: 2.5rem;
          }
        `}</style>
      </>
    )
  }
)
Button.displayName = "Button"

export { Button }

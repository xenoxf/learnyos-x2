import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * ============================================
 * ALERT COMPONENTS
 * ============================================
 * 
 * Componentes de alerta convertidos de Tailwind a CSS puro.
 * Incluye Alert y AlertDescription con variantes.
 */

const alertVariants = cva(
  "alert",
  {
    variants: {
      variant: {
        default: "alert-default",
        destructive: "alert-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <>
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
    <style jsx global>{`
      .alert {
        position: relative;
        width: 100%;
        border-radius: var(--radius);
        border: 1px solid hsl(var(--border));
        padding: 1rem;
        display: flex;
        gap: 0.75rem;
      }

      .alert-default {
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
      }

      .alert-destructive {
        border-color: hsl(var(--destructive));
        color: hsl(var(--destructive-foreground));
        background-color: hsl(var(--destructive) / 0.1);
      }
    `}</style>
  </>
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <>
    <h5
      ref={ref}
      className={cn("alert-title", className)}
      {...props}
    />
    <style jsx global>{`
      .alert-title {
        margin-bottom: 0.25rem;
        font-weight: 500;
        line-height: 1;
        letter-spacing: -0.025em;
      }
    `}</style>
  </>
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <>
    <div
      ref={ref}
      className={cn("alert-description", className)}
      {...props}
    />
    <style jsx global>{`
      .alert-description {
        font-size: 0.875rem;
        opacity: 0.9;
      }
    `}</style>
  </>
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

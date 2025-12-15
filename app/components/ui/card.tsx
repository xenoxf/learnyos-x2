import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * ============================================
 * CARD COMPONENTS
 * ============================================
 * 
 * Componentes de tarjeta convertidos de Tailwind a CSS puro.
 * Incluye Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <>
    <div
      ref={ref}
      className={cn("card", className)}
      {...props}
    />
    <style jsx global>{`
      .card {
        border-radius: var(--radius);
        border: 1px solid hsl(var(--border));
        background-color: hsl(var(--card));
        color: hsl(var(--card-foreground));
        box-shadow: var(--shadow-sm);
      }
    `}</style>
  </>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <>
    <div
      ref={ref}
      className={cn("card-header", className)}
      {...props}
    />
    <style jsx global>{`
      .card-header {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 1.5rem;
      }
    `}</style>
  </>
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <>
    <h3
      ref={ref}
      className={cn("card-title", className)}
      {...props}
    />
    <style jsx global>{`
      .card-title {
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1;
        letter-spacing: -0.025em;
        color: hsl(var(--card-foreground));
      }
    `}</style>
  </>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <>
    <p
      ref={ref}
      className={cn("card-description", className)}
      {...props}
    />
    <style jsx global>{`
      .card-description {
        font-size: 0.875rem;
        color: hsl(var(--muted-foreground));
      }
    `}</style>
  </>
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <>
    <div ref={ref} className={cn("card-content", className)} {...props} />
    <style jsx global>{`
      .card-content {
        padding: 1.5rem;
        padding-top: 0;
      }
    `}</style>
  </>
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <>
    <div
      ref={ref}
      className={cn("card-footer", className)}
      {...props}
    />
    <style jsx global>{`
      .card-footer {
        display: flex;
        align-items: center;
        padding: 1.5rem;
        padding-top: 0;
      }
    `}</style>
  </>
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

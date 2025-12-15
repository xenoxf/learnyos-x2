import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * ============================================
 * INPUT COMPONENT
 * ============================================
 * 
 * Componente de input convertido de Tailwind a CSS puro.
 * Incluye estilos para focus, disabled, placeholder, etc.
 */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <>
        <input
          type={type}
          className={cn("input", className)}
          ref={ref}
          {...props}
        />
        <style jsx global>{`
          .input {
            display: flex;
            height: 2.5rem;
            width: 100%;
            border-radius: calc(var(--radius) - 2px);
            border: 1px solid hsl(var(--input));
            background-color: hsl(var(--background));
            padding: 0 0.75rem;
            font-size: 1rem;
            line-height: 1.5rem;
            color: hsl(var(--foreground));
            transition: all var(--transition-base);
            outline: none;
          }

          .input::file-selector-button {
            border: 0;
            background: transparent;
            font-size: 0.875rem;
            font-weight: 500;
            color: hsl(var(--foreground));
            padding: 0;
            margin-right: 0.75rem;
          }

          .input::placeholder {
            color: hsl(var(--muted-foreground));
          }

          .input:focus-visible {
            outline: 2px solid transparent;
            outline-offset: 2px;
            border-color: hsl(var(--ring));
            box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
          }

          .input:disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }

          @media (min-width: 768px) {
            .input {
              font-size: 0.875rem;
            }
          }
        `}</style>
      </>
    )
  }
)
Input.displayName = "Input"

export { Input }

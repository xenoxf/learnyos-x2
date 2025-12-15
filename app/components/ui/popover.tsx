import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * ============================================
 * POPOVER COMPONENT
 * ============================================
 * 
 * Componente popover convertido de Tailwind a CSS puro.
 * Basado en Radix UI Popover.
 */

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <>
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn("popover-content", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
    <style jsx global>{`
      .popover-content {
        z-index: 50;
        width: 18rem;
        border-radius: calc(var(--radius) - 2px);
        border: 1px solid hsl(var(--border));
        background-color: hsl(var(--popover));
        color: hsl(var(--popover-foreground));
        padding: 1rem;
        box-shadow: var(--shadow-md);
        outline: none;
      }

      .popover-content[data-state="open"] {
        animation: zoom-in 0.2s ease-out, fade-in 0.2s ease-out;
      }

      .popover-content[data-state="closed"] {
        animation: zoom-out 0.2s ease-out, fade-out 0.2s ease-out;
      }

      .popover-content[data-side="bottom"] {
        animation-name: slide-in-from-top, fade-in;
      }

      .popover-content[data-side="left"] {
        animation-name: slide-in-from-right, fade-in;
      }

      .popover-content[data-side="right"] {
        animation-name: slide-in-from-left, fade-in;
      }

      .popover-content[data-side="top"] {
        animation-name: slide-in-from-bottom, fade-in;
      }
    `}</style>
  </>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }

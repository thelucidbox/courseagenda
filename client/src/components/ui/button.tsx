import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", // Added hover:scale-105
  {
    variants: {
      variant: {
        default: // Corresponds to btn-primary
          "bg-prodigy-purple text-white hover:bg-prodigy-light-purple shadow-prodigy-sm hover:shadow-prodigy-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-prodigy-sm hover:shadow-prodigy-md", // Added prodigy shadows
        outline: // Kept similar, uses accent colors
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground", // Changed border-input to border-border
        secondary: // Corresponds to btn-secondary
          "bg-background text-prodigy-purple border border-prodigy-purple hover:bg-prodigy-light-purple/10",
        ghost: // Subtle, uses accent for hover
          "hover:bg-accent hover:text-accent-foreground",
        link: // Standard link appearance
          "text-prodigy-purple underline-offset-4 hover:underline",
        yellow: // Corresponds to btn-yellow
          "bg-prodigy-yellow text-text-primary hover:bg-prodigy-light-yellow shadow-prodigy-sm hover:shadow-prodigy-md",
      },
      size: {
        default: "px-6 py-3", // Adjusted to match btn-primary and btn-secondary
        sm: "h-9 px-3", // Kept rounded-3xl from base
        lg: "h-11 px-8", // Kept rounded-3xl from base
        icon: "h-10 w-10", // Kept rounded-3xl from base
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

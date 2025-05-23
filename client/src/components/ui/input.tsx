import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Merged styles from input-prodigy and existing shadcn/ui input
          "flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:border-prodigy-purple focus-visible:ring-1 focus-visible:ring-prodigy-purple", // Focus styles from input-prodigy, using focus-visible for accessibility
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Removed ring-offset-background as input-prodigy doesn't specify it and focus is now primarily on border and a 1px ring.
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

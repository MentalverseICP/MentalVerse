import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50",
        secondary:
          "border-secondary/30 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "text-foreground border-border/40 bg-transparent hover:border-border/60 hover:bg-accent/5",
        success: "border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
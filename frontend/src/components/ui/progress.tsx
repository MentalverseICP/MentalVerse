import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-secondary/30 border border-border/20",
      className
    )}
    {...props}
  >
    <motion.div
      className="h-full w-full flex-1 bg-gradient-to-r from-primary to-primary/80 transition-all rounded-full shadow-lg"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      animate={{
        backgroundPosition: ["0% 0%", "100% 0%"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
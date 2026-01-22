import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { ContainerStatus } from "@/types"

const glowCardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow transition-all duration-300",
  {
    variants: {
      status: {
        HOT: "border-hot/30 hover:border-hot/50",
        WARM: "border-warm/30 hover:border-warm/50",
        COLD: "border-cold/30 hover:border-cold/50",
        none: "border-border hover:border-border/80",
      },
      glow: {
        true: "",
        false: "",
      },
      hover: {
        true: "hover:translate-y-[-2px] hover:shadow-lg",
        false: "",
      },
    },
    compoundVariants: [
      {
        status: "HOT",
        glow: true,
        className: "shadow-[0_0_20px_hsl(var(--status-hot-glow))]",
      },
      {
        status: "WARM",
        glow: true,
        className: "shadow-[0_0_16px_hsl(var(--status-warm-glow))]",
      },
      {
        status: "COLD",
        glow: true,
        className: "shadow-[0_0_12px_hsl(var(--status-cold-glow))]",
      },
    ],
    defaultVariants: {
      status: "none",
      glow: false,
      hover: true,
    },
  }
)

export interface GlowCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof glowCardVariants>, "status"> {
  status?: ContainerStatus | "none"
  animate?: boolean
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, status = "none", glow = false, hover, animate = false, children, ...props }, ref) => {
    const cardClassName = cn(glowCardVariants({ status, glow, hover }), className)

    if (animate && status !== "none") {
      return (
        <motion.div
          ref={ref}
          className={cardClassName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cardClassName}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlowCard.displayName = "GlowCard"

const GlowCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)}
    {...props}
  />
))
GlowCardHeader.displayName = "GlowCardHeader"

const GlowCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
GlowCardTitle.displayName = "GlowCardTitle"

const GlowCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
GlowCardContent.displayName = "GlowCardContent"

export { GlowCard, GlowCardHeader, GlowCardTitle, GlowCardContent, glowCardVariants }

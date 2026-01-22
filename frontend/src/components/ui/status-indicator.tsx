import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { ContainerStatus } from "@/types"

const statusIndicatorVariants = cva(
  "rounded-full",
  {
    variants: {
      status: {
        HOT: "bg-hot",
        WARM: "bg-warm",
        COLD: "bg-cold",
      },
      size: {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
      },
    },
    defaultVariants: {
      status: "COLD",
      size: "md",
    },
  }
)

const pulseVariants = {
  HOT: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  WARM: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  COLD: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0,
    },
  },
}

const glowVariants = {
  HOT: {
    boxShadow: [
      "0 0 4px hsl(var(--status-hot))",
      "0 0 12px hsl(var(--status-hot))",
      "0 0 4px hsl(var(--status-hot))",
    ],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  WARM: {
    boxShadow: [
      "0 0 3px hsl(var(--status-warm))",
      "0 0 10px hsl(var(--status-warm))",
      "0 0 3px hsl(var(--status-warm))",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  COLD: {
    boxShadow: "0 0 4px hsl(var(--status-cold))",
  },
}

export interface StatusIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    Omit<VariantProps<typeof statusIndicatorVariants>, "status"> {
  status: ContainerStatus
  animate?: boolean
}

function StatusIndicator({
  className,
  status,
  size,
  animate = true,
  ...props
}: StatusIndicatorProps) {
  const statusLabel = {
    HOT: "Active",
    WARM: "Standby",
    COLD: "Scaled Down",
  }

  if (!animate) {
    return (
      <div
        className={cn(statusIndicatorVariants({ status, size }), className)}
        role="status"
        aria-label={`Status: ${statusLabel[status]}`}
        {...props}
      />
    )
  }

  const pulseAnim = pulseVariants[status]
  const glowAnim = glowVariants[status]

  return (
    <motion.div
      className={cn(statusIndicatorVariants({ status, size }), className)}
      animate={{
        scale: pulseAnim.scale,
        opacity: pulseAnim.opacity,
        boxShadow: glowAnim.boxShadow,
      }}
      transition={pulseAnim.transition}
      role="status"
      aria-label={`Status: ${statusLabel[status]}`}
    />
  )
}

export { StatusIndicator, statusIndicatorVariants }

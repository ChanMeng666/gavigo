import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Flame, Thermometer, Snowflake, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ContainerStatus } from "@/types"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
  {
    variants: {
      status: {
        HOT: "bg-hot/20 text-hot border border-hot/30",
        WARM: "bg-warm/20 text-warm border border-warm/30",
        COLD: "bg-cold/20 text-cold border border-cold/30",
      },
      glow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        status: "HOT",
        glow: true,
        className: "shadow-[0_0_12px_hsl(var(--status-hot-glow))] animate-pulse-glow-fast",
      },
      {
        status: "WARM",
        glow: true,
        className: "shadow-[0_0_10px_hsl(var(--status-warm-glow))] animate-pulse-glow",
      },
      {
        status: "COLD",
        glow: true,
        className: "shadow-[0_0_8px_hsl(var(--status-cold-glow))]",
      },
    ],
    defaultVariants: {
      status: "COLD",
      glow: false,
    },
  }
)

const statusIconMap: Record<ContainerStatus, LucideIcon> = {
  HOT: Flame,
  WARM: Thermometer,
  COLD: Snowflake,
}

const statusLabelMap: Record<ContainerStatus, string> = {
  HOT: "Hot (Active)",
  WARM: "Warm (Standby)",
  COLD: "Cold (Scaled Down)",
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof statusBadgeVariants>, "status"> {
  status: ContainerStatus
  showIcon?: boolean
  showLabel?: boolean
}

function StatusBadge({
  className,
  status,
  glow = false,
  showIcon = true,
  showLabel = false,
  children,
  ...props
}: StatusBadgeProps) {
  const Icon = statusIconMap[status]
  const label = statusLabelMap[status]

  return (
    <div
      className={cn(statusBadgeVariants({ status, glow }), className)}
      role="status"
      aria-label={label}
      {...props}
    >
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {showLabel ? label : children || status}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants, statusIconMap, statusLabelMap }

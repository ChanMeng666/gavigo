import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface ScoreBarProps {
  value: number
  maxValue?: number
  warmThreshold?: number
  hotThreshold?: number
  showThresholds?: boolean
  showPercentage?: boolean
  animate?: boolean
  className?: string
  label?: string
}

function ScoreBar({
  value,
  maxValue = 1,
  warmThreshold = 0.4,
  hotThreshold = 0.7,
  showThresholds = true,
  showPercentage = true,
  animate = true,
  className,
  label,
}: ScoreBarProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100)
  const normalizedValue = value / maxValue

  // Determine color based on thresholds
  const getBarColor = () => {
    if (normalizedValue >= hotThreshold) return "bg-hot"
    if (normalizedValue >= warmThreshold) return "bg-warm"
    return "bg-cold"
  }

  const getGlowColor = () => {
    if (normalizedValue >= hotThreshold) return "shadow-[0_0_8px_hsl(var(--status-hot-glow))]"
    if (normalizedValue >= warmThreshold) return "shadow-[0_0_6px_hsl(var(--status-warm-glow))]"
    return "shadow-[0_0_4px_hsl(var(--status-cold-glow))]"
  }

  return (
    <div className={cn("w-full", className)} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={maxValue} aria-label={label}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        {/* Threshold markers */}
        {showThresholds && (
          <>
            <div
              className="absolute top-0 h-full w-px bg-warm/50 z-10"
              style={{ left: `${warmThreshold * 100}%` }}
              aria-hidden="true"
            />
            <div
              className="absolute top-0 h-full w-px bg-hot/50 z-10"
              style={{ left: `${hotThreshold * 100}%` }}
              aria-hidden="true"
            />
          </>
        )}

        {/* Progress bar */}
        {animate ? (
          <motion.div
            className={cn("h-full rounded-full", getBarColor(), getGlowColor())}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              mass: 0.5,
            }}
          />
        ) : (
          <div
            className={cn("h-full rounded-full", getBarColor(), getGlowColor())}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* Percentage label */}
      {showPercentage && (
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-mono">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  )
}

// Combined score display with breakdown
interface CombinedScoreBarProps {
  personalScore: number
  globalScore: number
  combinedScore: number
  personalWeight?: number
  globalWeight?: number
  warmThreshold?: number
  hotThreshold?: number
  animate?: boolean
  className?: string
}

function CombinedScoreBar({
  personalScore,
  globalScore,
  combinedScore,
  personalWeight = 0.6,
  globalWeight = 0.4,
  warmThreshold = 0.4,
  hotThreshold = 0.7,
  animate = true,
  className,
}: CombinedScoreBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Combined Score */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">Combined Score</span>
          <span className="font-mono text-foreground">
            {(combinedScore * 100).toFixed(0)}%
          </span>
        </div>
        <ScoreBar
          value={combinedScore}
          warmThreshold={warmThreshold}
          hotThreshold={hotThreshold}
          showPercentage={false}
          animate={animate}
        />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="flex justify-between text-muted-foreground mb-1">
            <span>Personal ({(personalWeight * 100).toFixed(0)}%)</span>
            <span className="font-mono">{(personalScore * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-accent-primary"
              initial={animate ? { width: 0 } : undefined}
              animate={{ width: `${personalScore * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-muted-foreground mb-1">
            <span>Global ({(globalWeight * 100).toFixed(0)}%)</span>
            <span className="font-mono">{(globalScore * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-accent-secondary"
              initial={animate ? { width: 0 } : undefined}
              animate={{ width: `${globalScore * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { ScoreBar, CombinedScoreBar }

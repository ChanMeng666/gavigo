import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Zap, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActivationSpineEvent, ActivationPhase, ResourceWeight, TelemetrySnapshot } from "@/types"

interface ActivationTimelineProps {
  events: ActivationSpineEvent[]
  contentTitles: Record<string, string>
  telemetrySnapshots?: Record<string, TelemetrySnapshot>
}

const phaseConfig: Record<ActivationPhase, { label: string; color: string; bgColor: string; dotColor: string }> = {
  INTENT: { label: "Intent", color: "text-gray-400", bgColor: "bg-gray-500/20", dotColor: "bg-gray-400" },
  PRE_WARM: { label: "Pre-Warm", color: "text-amber-400", bgColor: "bg-amber-500/20", dotColor: "bg-amber-400" },
  PREVIEW_READY: { label: "Ready", color: "text-green-400", bgColor: "bg-green-500/20", dotColor: "bg-green-400" },
  ACTIVATING: { label: "Activating", color: "text-orange-400", bgColor: "bg-orange-500/20", dotColor: "bg-orange-400" },
  HOT: { label: "Hot", color: "text-red-400", bgColor: "bg-red-500/20", dotColor: "bg-red-400" },
  DEACTIVATING: { label: "Leaving", color: "text-blue-300", bgColor: "bg-blue-500/20", dotColor: "bg-blue-300" },
  COOLING: { label: "Cooling", color: "text-blue-400", bgColor: "bg-blue-500/20", dotColor: "bg-blue-400" },
  RESTORE_START: { label: "Restoring", color: "text-cyan-400", bgColor: "bg-cyan-500/20", dotColor: "bg-cyan-400" },
  RESTORE_COMPLETE: { label: "Restored", color: "text-cyan-300", bgColor: "bg-cyan-500/20", dotColor: "bg-cyan-300" },
}

const weightLabels: Record<ResourceWeight, { label: string; className: string }> = {
  IDLE_MINIMAL: { label: "idle", className: "text-gray-500" },
  PREVIEW_LOW: { label: "preview", className: "text-amber-500" },
  FULL_HIGH: { label: "full", className: "text-red-400" },
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

interface ContentTimelineData {
  contentId: string
  phases: ActivationSpineEvent[]
  latestTimestamp: number
  isRestore: boolean
  restoreDurationMs?: number
}

function formatMetricMs(ms: number): string {
  if (ms === -1 || ms === 0) return ""
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function ActivationTimeline({ events, contentTitles, telemetrySnapshots }: ActivationTimelineProps) {
  // Group events by content_id and build timelines
  const timelines = useMemo(() => {
    const grouped = new Map<string, ActivationSpineEvent[]>()

    // events are newest-first, reverse for chronological order per content
    for (const event of events) {
      const existing = grouped.get(event.content_id) ?? []
      existing.push(event)
      grouped.set(event.content_id, existing)
    }

    const result: ContentTimelineData[] = []

    for (const [contentId, phases] of grouped) {
      // Sort phases chronologically
      phases.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      const isRestore = phases.some(p => p.phase === "RESTORE_START" || p.phase === "RESTORE_COMPLETE")

      let restoreDurationMs: number | undefined
      if (isRestore) {
        const start = phases.find(p => p.phase === "RESTORE_START")
        const complete = phases.find(p => p.phase === "RESTORE_COMPLETE")
        if (start && complete) {
          restoreDurationMs = new Date(complete.timestamp).getTime() - new Date(start.timestamp).getTime()
        }
      }

      result.push({
        contentId,
        phases,
        latestTimestamp: Math.max(...phases.map(p => new Date(p.timestamp).getTime())),
        isRestore,
        restoreDurationMs,
      })
    }

    // Sort by most recent activity, show latest 5
    result.sort((a, b) => b.latestTimestamp - a.latestTimestamp)
    return result.slice(0, 5)
  }, [events])

  const hasHot = (tl: ContentTimelineData) => tl.phases.some(p => p.phase === "HOT" || p.phase === "RESTORE_COMPLETE")

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Activation Spine
          {timelines.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {timelines.length} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timelines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Interact with the feed to see activation signals
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {timelines.map((tl) => (
                  <motion.div
                    key={tl.contentId}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: hasHot(tl) ? 0.7 : 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "rounded-lg p-3 bg-elevated",
                      tl.isRestore && "ring-1 ring-cyan-500/30"
                    )}
                  >
                    {/* Content header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {contentTitles[tl.contentId] || tl.contentId}
                        </span>
                        {tl.isRestore && (
                          <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 text-[10px] gap-1">
                            <Zap className="h-3 w-3" />
                            RESTORED{tl.restoreDurationMs != null && ` in ${formatDuration(tl.restoreDurationMs)}`}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Phase timeline */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {tl.phases.map((phase, i) => {
                        const config = phaseConfig[phase.phase]
                        const isLast = i === tl.phases.length - 1
                        const nextPhase = tl.phases[i + 1]
                        const elapsed = nextPhase
                          ? new Date(nextPhase.timestamp).getTime() - new Date(phase.timestamp).getTime()
                          : undefined

                        return (
                          <div key={phase.event_id} className="flex items-center">
                            {/* Phase node */}
                            <div className="flex flex-col items-center gap-1 min-w-[48px]">
                              <div className="relative">
                                <div className={cn(
                                  "h-3 w-3 rounded-full",
                                  config.dotColor,
                                )} />
                                {isLast && !hasHot(tl) && (
                                  <motion.div
                                    className={cn("absolute inset-[-3px] rounded-full border-2", config.dotColor.replace("bg-", "border-"))}
                                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                                )}
                              </div>
                              <span className={cn("text-[9px] font-medium leading-tight", config.color)}>
                                {config.label}
                              </span>
                              <span className={cn("text-[8px]", weightLabels[phase.resource_weight].className)}>
                                {weightLabels[phase.resource_weight].label}
                              </span>
                            </div>

                            {/* Connecting line with elapsed time */}
                            {!isLast && elapsed != null && (
                              <div className="flex flex-col items-center mx-1">
                                <span className="text-[8px] text-muted-foreground mb-0.5">
                                  {formatDuration(elapsed)}
                                </span>
                                <div className="w-8 h-px bg-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Inline telemetry metrics */}
                    {(() => {
                      const snap = telemetrySnapshots?.[tl.contentId]
                      if (!snap) return null
                      const items = [
                        { label: "Decision", val: snap.orchestration_decision_time_ms },
                        { label: "Prewarm", val: snap.prewarm_duration_ms },
                        { label: "Activation", val: snap.activation_latency_ms },
                        ...(snap.restore_latency_ms > 0 ? [{ label: "Restore", val: snap.restore_latency_ms }] : []),
                      ].filter(m => m.val > 0)
                      if (items.length === 0) return null
                      return (
                        <div className="flex items-center gap-3 mt-2 pt-1.5 border-t border-muted-foreground/10">
                          {snap.cache_hit_indicator && (
                            <span className="text-[9px] text-accent-success font-medium">CACHE HIT</span>
                          )}
                          {items.map(m => (
                            <span key={m.label} className="text-[9px] text-muted-foreground">
                              {m.label}: <span className="font-mono text-foreground/70">{formatMetricMs(m.val)}</span>
                            </span>
                          ))}
                        </div>
                      )
                    })()}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

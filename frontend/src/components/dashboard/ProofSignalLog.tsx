import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProofSignalEvent, ProofEventType } from "@/types"

interface ProofSignalLogProps {
  proofSignals: ProofSignalEvent[]
  contentTitles: Record<string, string>
}

const eventConfig: Record<ProofEventType, { label: string; color: string; bgColor: string }> = {
  intent_detected: { label: "Intent", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  orchestration_decision_made: { label: "Decision", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  prewarm_start: { label: "Prewarm", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  warm_ready: { label: "Warm Ready", color: "text-green-400", bgColor: "bg-green-500/20" },
  activation_request_received: { label: "Activate", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  hot_state_entered: { label: "Hot", color: "text-red-400", bgColor: "bg-red-500/20" },
  execution_ready: { label: "Exec Ready", color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  restore_start: { label: "Restore", color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  restore_complete: { label: "Restored", color: "text-cyan-300", bgColor: "bg-cyan-500/20" },
}

function formatTimestamp(tsMs: number): string {
  const d = new Date(tsMs)
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + `.${String(d.getMilliseconds()).padStart(3, "0")}`
}

interface GroupedAttempt {
  attemptId: string
  contentId: string
  events: ProofSignalEvent[]
  latestTs: number
}

export function ProofSignalLog({ proofSignals, contentTitles }: ProofSignalLogProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, GroupedAttempt>()

    for (const sig of proofSignals) {
      const existing = map.get(sig.attempt_id)
      if (existing) {
        existing.events.push(sig)
        existing.latestTs = Math.max(existing.latestTs, sig.ts_server_ms)
      } else {
        map.set(sig.attempt_id, {
          attemptId: sig.attempt_id,
          contentId: sig.content_id,
          events: [sig],
          latestTs: sig.ts_server_ms,
        })
      }
    }

    const result = Array.from(map.values())
    // Sort by most recent activity
    result.sort((a, b) => b.latestTs - a.latestTs)
    // Sort events within each group chronologically
    for (const group of result) {
      group.events.sort((a, b) => a.ts_server_ms - b.ts_server_ms)
    }
    return result.slice(0, 8)
  }, [proofSignals])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileCheck className="h-4 w-4 text-muted-foreground" />
          Proof Signal Log
          {proofSignals.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {proofSignals.length} events
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No proof signals yet. Interact with content to generate events.
          </p>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {grouped.map((group) => (
                  <motion.div
                    key={group.attemptId}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg p-2.5 bg-elevated"
                  >
                    {/* Attempt header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                        {contentTitles[group.contentId] || group.contentId}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 font-mono">
                        {group.attemptId.slice(0, 8)}
                      </span>
                    </div>

                    {/* Event list */}
                    <div className="space-y-1">
                      {group.events.map((evt) => {
                        const config = eventConfig[evt.event_type]
                        return (
                          <div
                            key={evt.event_id}
                            className="flex items-center gap-2 text-[11px]"
                          >
                            <span className="text-muted-foreground/60 font-mono w-[85px] shrink-0">
                              {formatTimestamp(evt.ts_server_ms)}
                            </span>
                            <Badge
                              className={cn(
                                "text-[9px] px-1.5 py-0 border-0 shrink-0",
                                config.bgColor,
                                config.color
                              )}
                            >
                              {config.label}
                            </Badge>
                            {evt.trigger_type && (
                              <span className="text-muted-foreground/50 flex items-center gap-0.5 shrink-0">
                                <Zap className="h-2.5 w-2.5" />
                                <span className="text-[9px]">{evt.trigger_type}</span>
                              </span>
                            )}
                            {evt.state_from && evt.state_to && (
                              <span className="text-muted-foreground/40 text-[9px] truncate">
                                {evt.state_from}→{evt.state_to}
                              </span>
                            )}
                            <span className="text-muted-foreground/30 text-[9px] ml-auto truncate max-w-[100px]" title={evt.source_event_type}>
                              {evt.source_event_type}
                            </span>
                          </div>
                        )
                      })}
                    </div>
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

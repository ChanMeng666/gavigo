import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, Check, Minus, Zap } from "lucide-react"
import type {
  TelemetrySnapshot,
  ProofSignalEvent,
  ActivationPathType,
} from "@/types"

interface TelemetryPanelProps {
  telemetrySnapshots: Record<string, TelemetrySnapshot>
  proofSignals: ProofSignalEvent[]
  contentTitles: Record<string, string>
}

const pathColors: Record<ActivationPathType, { bg: string; text: string; label: string }> = {
  COLD_PATH: { bg: "bg-cold/20", text: "text-cold", label: "Cold Path" },
  PREWARM_PATH: { bg: "bg-warm/20", text: "text-warm", label: "Prewarm Path" },
  RESTORE_PATH: { bg: "bg-cyan-500/20", text: "text-cyan-600 dark:text-cyan-400", label: "Restore Path" },
}

function formatMs(ms: number): string {
  if (ms === -1 || ms === 0) return "--"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function getLatencyColor(ms: number): string {
  if (ms === -1 || ms === 0) return "text-muted-foreground"
  if (ms < 500) return "text-accent-success"
  if (ms < 2000) return "text-warm"
  return "text-destructive"
}

export function TelemetryPanel({
  telemetrySnapshots,
  proofSignals,
  contentTitles,
}: TelemetryPanelProps) {
  const contentIds = useMemo(() => Object.keys(telemetrySnapshots), [telemetrySnapshots])

  // Default to the most recently active content
  const mostRecent = useMemo(() => {
    if (proofSignals.length === 0) return contentIds[0] ?? null
    return proofSignals[0]?.content_id ?? contentIds[0] ?? null
  }, [proofSignals, contentIds])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const activeId = selectedId ?? mostRecent
  const snapshot = activeId ? telemetrySnapshots[activeId] : null

  if (contentIds.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No telemetry data yet. Interact with content to generate proof signals.
          </p>
        </CardContent>
      </Card>
    )
  }

  const pathConfig = snapshot?.activation_path_type
    ? pathColors[snapshot.activation_path_type]
    : null

  const metrics = snapshot
    ? [
        { label: "Decision Time", value: snapshot.orchestration_decision_time_ms },
        { label: "Prewarm Duration", value: snapshot.prewarm_duration_ms },
        { label: "Activation Latency", value: snapshot.activation_latency_ms },
        { label: "Intent → Ready", value: snapshot.execution_ready_latency_ms !== -1 && snapshot.intent_ts > 0
            ? snapshot.execution_ready_ts > 0
              ? snapshot.execution_ready_ts - snapshot.intent_ts
              : -1
            : -1
        },
        { label: "Restore Latency", value: snapshot.restore_latency_ms },
      ]
    : []

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Telemetry
          </CardTitle>
          <Select
            value={activeId ?? ""}
            onValueChange={(v) => setSelectedId(v)}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Select content" />
            </SelectTrigger>
            <SelectContent>
              {contentIds.map((id) => (
                <SelectItem key={id} value={id} className="text-xs">
                  {contentTitles[id] ?? id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {snapshot ? (
          <div className="space-y-3">
            {/* Path + Cache Hit */}
            <div className="flex items-center gap-2 flex-wrap">
              {pathConfig && (
                <Badge className={`${pathConfig.bg} ${pathConfig.text} border-0`}>
                  {pathConfig.label}
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {snapshot.cache_hit_indicator ? (
                  <>
                    <Check className="h-3 w-3 text-accent-success" />
                    <span className="text-accent-success">Cache Hit</span>
                  </>
                ) : (
                  <>
                    <Minus className="h-3 w-3" />
                    <span>Cache Miss</span>
                  </>
                )}
              </div>
              {snapshot.trigger_type && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  {snapshot.trigger_type}
                </Badge>
              )}
            </div>

            {/* Reasoning */}
            {snapshot.last_reasoning_short && (
              <p className="text-xs text-muted-foreground italic truncate">
                {snapshot.last_reasoning_short}
              </p>
            )}

            {/* Metrics Table */}
            <div className="space-y-1.5">
              {metrics.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-mono font-medium ${getLatencyColor(value)}`}>
                    {formatMs(value)}
                  </span>
                </div>
              ))}
            </div>

            {/* Attempt ID */}
            <p className="text-[10px] text-muted-foreground/50 font-mono truncate pt-1">
              attempt: {snapshot.attempt_id}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a content item to view telemetry.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/ui/status-badge"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Gamepad2 } from "lucide-react"
import { statusIcons, statusConfig } from "@/components/icons"
import type { ContentItem, ContainerStatus as ContainerStatusType, TelemetrySnapshot } from "@/types"

interface WorkloadStatusProps {
  content: ContentItem[]
  containerStates: Record<string, ContainerStatusType>
  telemetrySnapshots?: Record<string, TelemetrySnapshot>
}

function getWarmingLabel(snapshot: TelemetrySnapshot | undefined): string | null {
  if (!snapshot) return null
  if (snapshot.prewarm_start_ts > 0 && snapshot.warm_ready_ts === 0 && snapshot.current_state !== "HOT") {
    return "Warming..."
  }
  if (snapshot.warm_ready_ts > 0 && snapshot.current_state === "WARM") {
    return "Prewarmed"
  }
  return null
}

export function WorkloadStatus({ content, containerStates, telemetrySnapshots }: WorkloadStatusProps) {
  // Filter to game workloads only
  const gameContent = content.filter((item) => item.type === "GAME")

  const gameStates = Object.fromEntries(
    gameContent.map((item) => [item.id, containerStates[item.id] || item.container_status])
  )

  const statusCounts = {
    HOT: Object.values(gameStates).filter((s) => s === "HOT").length,
    WARM: Object.values(gameStates).filter((s) => s === "WARM").length,
    COLD: Object.values(gameStates).filter((s) => s === "COLD").length,
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          Game Workloads
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-3">
          <div className="space-y-2" role="list" aria-label="Workload status list">
            {gameContent.map((item) => {
              const status = containerStates[item.id] || item.container_status
              const snapshot = telemetrySnapshots?.[item.id]
              const warmingLabel = getWarmingLabel(snapshot)

              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-elevated hover:bg-overlay transition-colors"
                  role="listitem"
                  aria-label={`${item.title}: ${statusConfig[status].label}`}
                >
                  <StatusIndicator status={status} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {item.deployment_name}
                      </p>
                      {warmingLabel && (
                        <span className={`text-[10px] font-medium ${
                          warmingLabel === "Warming..."
                            ? "text-warm animate-pulse"
                            : "text-warm"
                        }`}>
                          {warmingLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={status} glow={status !== "COLD"} />
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Summary Footer */}
        <div className="flex justify-between text-sm" role="status" aria-label="Workload status summary">
          {(["HOT", "WARM", "COLD"] as const).map((status) => {
            const Icon = statusIcons[status]
            const config = statusConfig[status]

            return (
              <div key={status} className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${config.className}`} />
                <span className="text-muted-foreground">
                  {status}: <span className="font-medium text-foreground">{statusCounts[status]}</span>
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

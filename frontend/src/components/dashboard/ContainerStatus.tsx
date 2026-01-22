import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/ui/status-badge"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { ServerIcon } from "@/components/icons"
import { statusIcons, statusConfig } from "@/components/icons"
import type { ContentItem, ContainerStatus as ContainerStatusType } from "@/types"

interface ContainerStatusProps {
  content: ContentItem[]
  containerStates: Record<string, ContainerStatusType>
}

export function ContainerStatus({ content, containerStates }: ContainerStatusProps) {
  const statusCounts = {
    HOT: Object.values(containerStates).filter((s) => s === "HOT").length,
    WARM: Object.values(containerStates).filter((s) => s === "WARM").length,
    COLD: Object.values(containerStates).filter((s) => s === "COLD").length,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ServerIcon className="h-4 w-4 text-muted-foreground" />
          Container States
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-3">
          <div className="space-y-2" role="list" aria-label="Container status list">
            {content.map((item) => {
              const status = containerStates[item.id] || item.container_status

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-elevated hover:bg-overlay transition-colors"
                  role="listitem"
                  aria-label={`${item.title}: ${statusConfig[status].label}`}
                >
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={status} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {item.deployment_name}
                      </p>
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
        <div className="flex justify-between text-sm" role="status" aria-label="Container status summary">
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

import { useMemo } from "react"
import type { UserActivityEvent } from "@/types"

interface ScreenDistributionProps {
  userActivities: UserActivityEvent[]
}

interface ScreenTime {
  screen: string
  durationMs: number
  percentage: number
}

const SCREEN_COLORS: Record<string, string> = {
  feed: "bg-violet-500",
  explore: "bg-cyan-500",
  chat: "bg-amber-500",
  profile: "bg-emerald-500",
  login: "bg-rose-500",
  register: "bg-rose-400",
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

export function ScreenDistribution({
  userActivities,
}: ScreenDistributionProps) {
  const screenTimes = useMemo<ScreenTime[]>(() => {
    // Filter to only screen_view events, oldest first
    const views = userActivities
      .filter((a) => a.event_type === "screen_view" && a.screen_name)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

    if (views.length === 0) return []

    const timeMap: Record<string, number> = {}
    const now = Date.now()

    for (let i = 0; i < views.length; i++) {
      const screen = views[i].screen_name!
      const start = new Date(views[i].timestamp).getTime()
      const end =
        i + 1 < views.length
          ? new Date(views[i + 1].timestamp).getTime()
          : now

      timeMap[screen] = (timeMap[screen] || 0) + (end - start)
    }

    const totalMs = Object.values(timeMap).reduce((a, b) => a + b, 0)
    if (totalMs === 0) return []

    return Object.entries(timeMap)
      .map(([screen, durationMs]) => ({
        screen,
        durationMs,
        percentage: Math.round((durationMs / totalMs) * 100),
      }))
      .sort((a, b) => b.durationMs - a.durationMs)
  }, [userActivities])

  if (screenTimes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">
            Screen Distribution
          </h3>
        </div>
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Screen time data will appear here
          </p>
        </div>
      </div>
    )
  }

  const maxDuration = screenTimes[0]?.durationMs || 1

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">
          Screen Distribution
        </h3>
      </div>

      <div className="p-4 space-y-2">
        {screenTimes.map(({ screen, durationMs, percentage }) => (
          <div key={screen} className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground w-14 truncate capitalize">
              {screen}
            </span>
            <div className="flex-1 h-2.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  SCREEN_COLORS[screen] || "bg-slate-500"
                }`}
                style={{
                  width: `${Math.max(4, (durationMs / maxDuration) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
              {percentage}%
            </span>
            <span className="text-[10px] text-muted-foreground/60 tabular-nums w-12 text-right">
              {formatDuration(durationMs)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

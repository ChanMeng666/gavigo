import type { EngagementSummary } from "@/types"

interface UserEngagementProps {
  engagement: EngagementSummary | null
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

export function UserEngagement({ engagement }: UserEngagementProps) {
  const themeTimes = engagement?.theme_focus_times || {}
  const sortedThemes = Object.entries(themeTimes).sort(([, a], [, b]) => b - a)
  const maxTime = sortedThemes.length > 0 ? sortedThemes[0][1] : 1

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">
          User Engagement
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Focus */}
        {engagement ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Currently viewing
              </span>
              <span className="inline-flex items-center rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-600 dark:text-cyan-400">
                {engagement.theme}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {engagement.active_content_title}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Focus:{" "}
                <span className="text-foreground tabular-nums">
                  {formatDuration(engagement.focus_duration_ms)}
                </span>
              </span>
              <span>
                Scroll pos:{" "}
                <span className="text-foreground tabular-nums">
                  {engagement.scroll_position}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">
              Waiting for user activity...
            </p>
          </div>
        )}

        {/* Theme Focus Breakdown */}
        {sortedThemes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">
              Theme focus times
            </span>
            {sortedThemes.slice(0, 6).map(([theme, timeMs]) => (
              <div key={theme} className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground w-14 truncate">
                  {theme}
                </span>
                <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500/70 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        4,
                        (timeMs / maxTime) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">
                  {formatDuration(timeMs)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

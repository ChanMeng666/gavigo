import { ScrollArea } from "@/components/ui/scroll-area"
import type { SocialEvent } from "@/types"

interface SocialActivityFeedProps {
  events: SocialEvent[]
  contentTitles: Record<string, string>
}

function getEventIcon(type: string): string {
  switch (type) {
    case "like":
      return "\u2764\uFE0F"
    case "unlike":
      return "\uD83D\uDC94"
    case "comment":
      return "\uD83D\uDCAC"
    case "follow":
      return "\uD83D\uDC64"
    case "unfollow":
      return "\uD83D\uDC64"
    default:
      return "\u2B50"
  }
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffS = Math.floor(diffMs / 1000)

  if (diffS < 5) return "just now"
  if (diffS < 60) return `${diffS}s ago`
  const diffM = Math.floor(diffS / 60)
  if (diffM < 60) return `${diffM}m ago`
  const diffH = Math.floor(diffM / 60)
  return `${diffH}h ago`
}

function formatEvent(
  event: SocialEvent,
  contentTitles: Record<string, string>
): string {
  const contentName = event.content_id
    ? contentTitles[event.content_id] || event.content_id
    : ""

  switch (event.event_type) {
    case "like":
      return `${event.username} liked ${contentName}`
    case "unlike":
      return `${event.username} unliked ${contentName}`
    case "comment":
      return `${event.username}: ${event.text || ""}`
    case "follow":
      return `${event.username} followed ${event.target_user || ""}`
    case "unfollow":
      return `${event.username} unfollowed ${event.target_user || ""}`
    default:
      return `${event.username} performed ${event.event_type}`
  }
}

export function SocialActivityFeed({
  events,
  contentTitles,
}: SocialActivityFeedProps) {
  const isMuted = (type: string) => type === "unlike" || type === "unfollow"

  return (
    <div className="rounded-lg border border-border bg-card h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">
          Social Activity
        </h3>
        {events.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">
            {events.length} events
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-1.5">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">
                Social interactions will appear here
              </p>
            </div>
          ) : (
            events.slice(0, 50).map((event, i) => (
              <div
                key={`${event.timestamp}-${i}`}
                className={`flex items-start gap-2 px-2 py-1.5 rounded text-xs ${
                  isMuted(event.event_type)
                    ? "opacity-50"
                    : "hover:bg-muted/50"
                }`}
              >
                <span className="flex-shrink-0 mt-0.5 text-sm leading-none">
                  {getEventIcon(event.event_type)}
                </span>
                <span className="flex-1 min-w-0 text-muted-foreground truncate">
                  {formatEvent(event, contentTitles)}
                </span>
                <span className="flex-shrink-0 text-[10px] text-muted-foreground/60 tabular-nums">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

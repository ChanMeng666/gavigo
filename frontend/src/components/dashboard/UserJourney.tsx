import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { UserActivityEvent, SocialEvent } from "@/types"

interface UserJourneyProps {
  userActivities: UserActivityEvent[]
  socialEvents: SocialEvent[]
}

interface JourneyNode {
  icon: string
  label: string
  detail?: string
  timestamp: string
  type: "screen" | "social" | "focus" | "action"
}

function getEventIcon(event: UserActivityEvent): string {
  switch (event.event_type) {
    case "screen_view":
      switch (event.screen_name) {
        case "feed":
          return "\uD83C\uDFE0"
        case "explore":
          return "\uD83E\uDDED"
        case "chat":
          return "\uD83D\uDCAC"
        case "profile":
          return "\uD83D\uDC64"
        case "login":
          return "\uD83D\uDD10"
        case "register":
          return "\uD83D\uDCDD"
        default:
          return "\uD83D\uDCF1"
      }
    case "search":
      return "\uD83D\uDD0D"
    case "filter":
      return "\uD83C\uDFF7\uFE0F"
    case "chat_message":
      return "\uD83D\uDCAC"
    case "auth_login":
      return "\uD83D\uDD10"
    case "auth_register":
      return "\uD83D\uDCDD"
    case "profile_edit":
      return "\u270F\uFE0F"
    case "settings_view":
      return "\u2699\uFE0F"
    default:
      return "\u2B50"
  }
}

function getEventLabel(event: UserActivityEvent): string {
  switch (event.event_type) {
    case "screen_view":
      return event.screen_name || "Screen"
    case "search":
      return `Search`
    case "filter":
      return `Filter`
    case "chat_message":
      return `AI Chat (${event.value || "0"} chars)`
    case "auth_login":
      return event.value === "success" ? "Logged in" : "Login failed"
    case "auth_register":
      return event.value === "success" ? "Registered" : "Register failed"
    case "profile_edit":
      return `Updated: ${event.value || "profile"}`
    case "settings_view":
      return event.value || "Settings"
    default:
      return event.action || event.event_type
  }
}

function getEventDetail(event: UserActivityEvent): string | undefined {
  if (event.event_type === "search") return `"${event.value}"`
  if (event.event_type === "filter") return event.value
  return undefined
}

function getSocialIcon(type: string): string {
  switch (type) {
    case "like":
      return "\u2764\uFE0F"
    case "comment":
      return "\uD83D\uDCAC"
    case "follow":
      return "\uD83D\uDC64"
    case "unlike":
      return "\uD83D\uDC94"
    case "unfollow":
      return "\uD83D\uDC64"
    default:
      return "\u2B50"
  }
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffS = Math.floor((now - then) / 1000)

  if (diffS < 5) return "now"
  if (diffS < 60) return `${diffS}s`
  const diffM = Math.floor(diffS / 60)
  if (diffM < 60) return `${diffM}m`
  return `${Math.floor(diffM / 60)}h`
}

function mergeAndSort(
  activities: UserActivityEvent[],
  socials: SocialEvent[]
): JourneyNode[] {
  const nodes: JourneyNode[] = []

  for (const a of activities) {
    nodes.push({
      icon: getEventIcon(a),
      label: getEventLabel(a),
      detail: getEventDetail(a),
      timestamp: a.timestamp,
      type: a.event_type === "screen_view" ? "screen" : "action",
    })
  }

  for (const s of socials) {
    nodes.push({
      icon: getSocialIcon(s.event_type),
      label: `${s.event_type}`,
      timestamp: s.timestamp,
      type: "social",
    })
  }

  nodes.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return nodes.slice(-30)
}

const TYPE_COLORS: Record<string, string> = {
  screen: "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30",
  social: "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30",
  focus: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  action: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
}

export function UserJourney({
  userActivities,
  socialEvents,
}: UserJourneyProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const nodes = mergeAndSort(userActivities, socialEvents)

  // Auto-scroll to bottom to show latest events
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // ScrollArea viewport is the first child
    const viewport = el.querySelector("[data-radix-scroll-area-viewport]")
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [nodes.length])

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">
            User Journey
          </h3>
        </div>
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            User journey events will appear here as users interact with the app
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">
          User Journey
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {nodes.length} events
        </span>
      </div>

      <div ref={scrollRef}>
        <ScrollArea className="h-[120px]">
          <div className="flex flex-wrap gap-1.5 px-4 py-3">
            {nodes.map((node, i) => (
              <div
                key={`${node.timestamp}-${i}`}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] ${
                  TYPE_COLORS[node.type] || TYPE_COLORS.action
                }`}
                title={`${node.detail || node.label} — ${new Date(node.timestamp).toLocaleTimeString()}`}
              >
                <span className="text-xs leading-none">{node.icon}</span>
                <span className="max-w-[80px] truncate">{node.label}</span>
                <span className="text-[9px] opacity-50">{formatRelativeTime(node.timestamp)}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

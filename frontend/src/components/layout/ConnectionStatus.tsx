import { cn } from "@/lib/utils"
import { ConnectedIcon, DisconnectedIcon } from "@/components/icons"

interface ConnectionStatusProps {
  connected: boolean
  sessionId?: string
  className?: string
}

export function ConnectionStatus({ connected, sessionId, className }: ConnectionStatusProps) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-accent-success animate-pulse" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-accent-success/50 animate-ping" />
            </div>
            <ConnectedIcon className="h-4 w-4 text-accent-success" />
          </>
        ) : (
          <>
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <DisconnectedIcon className="h-4 w-4 text-destructive" />
          </>
        )}
        <span className="text-sm text-muted-foreground">
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {sessionId && connected && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-foreground/30">|</span>
          <span className="font-mono">{sessionId.slice(0, 8)}...</span>
        </div>
      )}
    </div>
  )
}

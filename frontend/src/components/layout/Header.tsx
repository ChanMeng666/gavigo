import { cn } from "@/lib/utils"
import { ViewToggle, type ViewMode } from "./ViewToggle"
import { ConnectionStatus } from "./ConnectionStatus"

interface HeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  connected: boolean
  sessionId?: string
  className?: string
}

export function Header({
  viewMode,
  onViewModeChange,
  connected,
  sessionId,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm",
        className
      )}
    >
      {/* Logo / Title */}
      <div className="flex items-center gap-3">
        <img
          src="/gavigo-logo.svg"
          alt="GAVIGO Logo"
          className="h-9 w-auto"
        />
        <div className="hidden sm:block">
          <h1 className="text-lg font-display font-semibold text-foreground">
            GAVIGO IRE
          </h1>
          <p className="text-xs text-muted-foreground">
            AI Container Orchestration
          </p>
        </div>
      </div>

      {/* Connection Status - Center */}
      <ConnectionStatus
        connected={connected}
        sessionId={sessionId}
        className="hidden md:flex"
      />

      {/* View Toggle - Right */}
      <ViewToggle mode={viewMode} onChange={onViewModeChange} />
    </header>
  )
}

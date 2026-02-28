import { cn } from "@/lib/utils"
import { ViewToggle, type ViewMode } from "./ViewToggle"
import { ConnectionStatus } from "./ConnectionStatus"
import { Smartphone, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useTheme } from "@/components/ThemeProvider"

interface HeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  connected: boolean
  sessionId?: string
  className?: string
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
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

      {/* Theme Toggle + View Toggle + Mobile Link - Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ViewToggle mode={viewMode} onChange={onViewModeChange} />
        <div className="w-px h-6 bg-border" />
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a href="/mobile/" target="_blank" rel="noopener noreferrer" aria-label="Open Mobile App">
                  <Smartphone className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Open Mobile App
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}

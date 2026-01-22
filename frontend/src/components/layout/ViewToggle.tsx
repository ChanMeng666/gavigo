import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { SplitViewIcon, StreamIcon, DashboardIcon } from "@/components/icons"

export type ViewMode = "split" | "stream" | "dashboard"

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

const viewModes: { value: ViewMode; label: string; icon: typeof SplitViewIcon }[] = [
  { value: "split", label: "Split View", icon: SplitViewIcon },
  { value: "stream", label: "Stream View", icon: StreamIcon },
  { value: "dashboard", label: "Dashboard View", icon: DashboardIcon },
]

export function ViewToggle({ mode, onChange, className }: ViewToggleProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg bg-elevated p-1",
          className
        )}
        role="tablist"
        aria-label="View mode selection"
      >
        {viewModes.map(({ value, label, icon: Icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <Button
                variant={mode === value ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  "h-8 w-8 transition-all",
                  mode === value && "bg-accent-primary/20 text-accent-primary"
                )}
                onClick={() => onChange(value)}
                role="tab"
                aria-selected={mode === value}
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

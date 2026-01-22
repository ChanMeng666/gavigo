import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { modeIcons, modeConfig } from "@/components/icons"
import { cn } from "@/lib/utils"
import type { OperationalMode } from "@/types"

interface ModeIndicatorProps {
  currentMode: OperationalMode
  activeContentId: string | null
  since?: string
}

export function ModeIndicator({
  currentMode,
  activeContentId,
  since,
}: ModeIndicatorProps) {
  const CurrentModeIcon = modeIcons[currentMode]
  const config = modeConfig[currentMode]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CurrentModeIcon className="h-4 w-4 text-muted-foreground" />
          Current Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Mode Display */}
        <div
          className={cn(
            "relative overflow-hidden rounded-lg p-4",
            "bg-gradient-to-br",
            config.gradient
          )}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <CurrentModeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-display font-bold text-lg">{config.label}</h4>
                <p className="text-white/80 text-sm">{config.description}</p>
              </div>
            </div>
            {activeContentId && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-white/70 text-sm flex items-center gap-2">
                  Active Content:
                  <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">
                    {activeContentId.slice(0, 12)}...
                  </span>
                </p>
              </div>
            )}
            {since && (
              <p className="text-white/50 text-xs mt-2">
                Since: {new Date(since).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Mode Options Grid */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(modeConfig) as [OperationalMode, typeof config][]).map(
            ([mode, cfg]) => {
              const ModeIcon = modeIcons[mode]
              const isActive = mode === currentMode

              return (
                <div
                  key={mode}
                  className={cn(
                    "p-2 rounded-lg text-center transition-all",
                    isActive
                      ? "bg-accent/20 ring-2 ring-accent"
                      : "bg-elevated opacity-60"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 mx-auto rounded-md flex items-center justify-center mb-1",
                    isActive ? "bg-accent/30" : "bg-muted"
                  )}>
                    <ModeIcon className={cn(
                      "h-4 w-4",
                      isActive ? "text-accent" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px]",
                    isActive ? "text-accent" : "text-muted-foreground"
                  )}>
                    {cfg.label}
                  </span>
                </div>
              )
            }
          )}
        </div>
      </CardContent>
    </Card>
  )
}

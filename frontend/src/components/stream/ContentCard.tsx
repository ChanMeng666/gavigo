import { forwardRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { contentTypeIcons, contentTypeConfig } from "@/components/icons"
import { PlayIcon, Loader2 } from "@/components/icons"
import { cn } from "@/lib/utils"
import type { ContentItem, ContainerStatus } from "@/types"

interface ContentCardProps {
  content: ContentItem
  containerStatus: ContainerStatus
  isActive: boolean
  onActivate: (contentId: string) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(
  ({ content, containerStatus, isActive, onActivate, onMouseEnter, onMouseLeave }, ref) => {
    const TypeIcon = contentTypeIcons[content.type]
    const typeConfig = contentTypeConfig[content.type]

    // Track when content is transitioning from COLD (warming in progress)
    const [wasJustCold, setWasJustCold] = useState(containerStatus === "COLD")
    const [isWarming, setIsWarming] = useState(false)

    useEffect(() => {
      if (containerStatus === "COLD") {
        setWasJustCold(true)
        setIsWarming(false)
      } else if (wasJustCold) {
        // Transitioned from COLD to WARM/HOT - show brief warming animation
        setIsWarming(true)
        const timer = setTimeout(() => {
          setIsWarming(false)
          setWasJustCold(false)
        }, 500)
        return () => clearTimeout(timer)
      }
    }, [containerStatus, wasJustCold])

    return (
      <div
        ref={ref}
        data-content-id={content.id}
        data-theme={content.theme}
        className={cn(
          "relative bg-card rounded-xl overflow-hidden transition-all duration-300 card-hover",
          isActive && "ring-2 ring-accent scale-[1.02]",
          !isActive && "hover:scale-[1.01]"
        )}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-elevated">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-40",
              typeConfig.gradient
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "h-16 w-16 rounded-2xl flex items-center justify-center bg-black/30 backdrop-blur-sm",
              isActive && "scale-110 transition-transform"
            )}>
              <TypeIcon className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Status indicator */}
          <div className="absolute top-3 right-3">
            <StatusIndicator status={containerStatus} size="md" />
          </div>

          {/* Score indicator */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1">
            <span className="text-xs text-white font-mono">
              {(content.combined_score * 100).toFixed(0)}%
            </span>
          </div>

          {/* Content type badge */}
          <div className="absolute top-3 left-3">
            <Badge
              className={cn(
                "gap-1 bg-gradient-to-r text-white border-0",
                typeConfig.gradient
              )}
            >
              <TypeIcon className="h-3 w-3" />
              {typeConfig.label}
            </Badge>
          </div>
        </div>

        {/* Content info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground font-display font-semibold truncate">
                {content.title}
              </h3>
              <p className="text-muted-foreground text-sm truncate">
                {content.description}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">
                  #{content.theme}
                </Badge>
                <Badge
                  variant={
                    containerStatus === "HOT" ? "hot" :
                    containerStatus === "WARM" ? "warm" : "cold"
                  }
                  className="text-[10px]"
                >
                  {containerStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Activate button */}
          <Button
            onClick={() => onActivate(content.id)}
            disabled={containerStatus === "COLD"}
            variant={
              containerStatus === "HOT" ? "hot" :
              containerStatus === "WARM" ? "warm" : "secondary"
            }
            className={cn(
              "mt-4 w-full gap-2",
              containerStatus === "COLD" && isActive && "animate-pulse"
            )}
            size="sm"
          >
            {isWarming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Warming...
              </>
            ) : containerStatus === "COLD" ? (
              <>
                <Loader2 className={cn("h-4 w-4", isActive && "animate-spin")} />
                {isActive ? "Preparing..." : "Not Ready"}
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                {containerStatus === "HOT" ? "Launch Now" : "Activate"}
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }
)

ContentCard.displayName = "ContentCard"

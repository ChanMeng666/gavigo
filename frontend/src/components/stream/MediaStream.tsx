import { useRef, useEffect, useCallback, useState } from "react"
import { ContentCard } from "./ContentCard"
import { useEngagement } from "@/hooks/useEngagement"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { StreamIcon } from "@/components/icons"
import type {
  ContentItem,
  ContainerStatus,
  FocusEventPayload,
  ScrollUpdatePayload,
  ActivationRequestPayload,
} from "@/types"

interface MediaStreamProps {
  content: ContentItem[]
  containerStates: Record<string, ContainerStatus>
  onFocusEvent: (payload: FocusEventPayload) => void
  onScrollUpdate: (payload: ScrollUpdatePayload) => void
  onActivationRequest: (payload: ActivationRequestPayload) => void
}

export function MediaStream({
  content,
  containerStates,
  onFocusEvent,
  onScrollUpdate,
  onActivationRequest,
}: MediaStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusedContentId, setFocusedContentId] = useState<string | null>(null)
  const [visibleContent, setVisibleContent] = useState<string[]>([])
  const lastScrollPosition = useRef(0)
  const lastScrollTime = useRef(Date.now())

  const { startFocus, endFocus, createVisibilityObserver } = useEngagement({
    onFocusEvent,
    reportIntervalMs: 1000,
  })

  // Track scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const now = Date.now()
    const timeDiff = now - lastScrollTime.current
    const scrollTop = containerRef.current.scrollTop
    const scrollDiff = scrollTop - lastScrollPosition.current
    const velocity = timeDiff > 0 ? scrollDiff / timeDiff : 0

    onScrollUpdate({
      position: scrollTop,
      velocity,
      visible_content: visibleContent,
    })

    lastScrollPosition.current = scrollTop
    lastScrollTime.current = now
  }, [onScrollUpdate, visibleContent])

  // Set up visibility observer
  useEffect(() => {
    const observer = createVisibilityObserver((contentId, theme, isVisible) => {
      if (isVisible) {
        setVisibleContent((prev) => {
          if (!prev.includes(contentId)) {
            return [...prev, contentId]
          }
          return prev
        })
        // Auto-start focus on visible content
        if (!focusedContentId) {
          setFocusedContentId(contentId)
          startFocus(contentId, theme)
        }
      } else {
        setVisibleContent((prev) => prev.filter((id) => id !== contentId))
        if (focusedContentId === contentId) {
          endFocus()
          setFocusedContentId(null)
        }
      }
    })

    // Observe all content cards
    const cards = document.querySelectorAll("[data-content-id]")
    cards.forEach((card) => observer.observe(card))

    return () => {
      observer.disconnect()
    }
  }, [content, createVisibilityObserver, startFocus, endFocus, focusedContentId])

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const handleMouseEnter = useCallback(
    (contentId: string, theme: string) => {
      setFocusedContentId(contentId)
      startFocus(contentId, theme)
    },
    [startFocus]
  )

  const handleMouseLeave = useCallback(() => {
    endFocus()
    setFocusedContentId(null)
  }, [endFocus])

  const handleActivate = useCallback(
    (contentId: string) => {
      onActivationRequest({ content_id: contentId })
    },
    [onActivationRequest]
  )

  return (
    <div className="h-full flex flex-col bg-base">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-surface/50">
        <div className="flex items-center gap-2">
          <StreamIcon className="h-5 w-5 text-accent-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">
            Mixed Media Stream
          </h2>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Scroll and interact to trigger AI recommendations
        </p>
      </div>

      {/* Content stream */}
      <ScrollArea className="flex-1" ref={containerRef}>
        <div className="p-4">
          {content.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <StreamIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Loading content...</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {content.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  containerStatus={containerStates[item.id] || item.container_status}
                  isActive={focusedContentId === item.id}
                  onActivate={handleActivate}
                  onMouseEnter={() => handleMouseEnter(item.id, item.theme)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with stats */}
      <div className="flex-shrink-0 p-3 border-t border-border bg-surface/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {content.length} items
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {visibleContent.length} visible
            </Badge>
          </div>
          {focusedContentId && (
            <span className="text-xs text-accent-primary font-mono">
              {focusedContentId.slice(0, 12)}...
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

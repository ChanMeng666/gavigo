import { useRef, useEffect, useCallback, useState } from "react"
import { PhoneMockup } from "./PhoneMockup"
import { TikTokContentView } from "./TikTokContentView"
import { useEngagement } from "@/hooks/useEngagement"
import { StreamIcon } from "@/components/icons"
import type {
  ContentItem,
  ContainerStatus,
  FocusEventPayload,
  ScrollUpdatePayload,
  ActivationRequestPayload,
} from "@/types"

// When a React Native Web build is available, set this to the URL
// e.g., "/mobile-web" or "http://localhost:8081" in dev
const RN_WEB_URL = import.meta.env.VITE_RN_WEB_URL || ""

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
  const [currentContentId, setCurrentContentId] = useState<string | null>(null)
  const lastScrollTime = useRef(Date.now())
  const useNativeApp = !!RN_WEB_URL

  const { startFocus, endFocus } = useEngagement({
    onFocusEvent,
    reportIntervalMs: 1000,
  })

  // Handle content change (when user scrolls to new content)
  const handleContentChange = useCallback(
    (contentId: string, theme: string) => {
      // End focus on previous content
      if (currentContentId && currentContentId !== contentId) {
        endFocus()
      }

      // Start focus on new content
      setCurrentContentId(contentId)
      startFocus(contentId, theme)

      // Send scroll update
      const now = Date.now()
      const timeDiff = now - lastScrollTime.current
      onScrollUpdate({
        position: 0,
        velocity: timeDiff > 0 ? 100 / timeDiff : 0,
        visible_content: [contentId],
      })
      lastScrollTime.current = now
    },
    [currentContentId, endFocus, startFocus, onScrollUpdate]
  )

  // Handle activation request
  const handleActivate = useCallback(
    (contentId: string) => {
      onActivationRequest({ content_id: contentId })
    },
    [onActivationRequest]
  )

  // Start focus on first content when loaded
  useEffect(() => {
    if (content.length > 0 && !currentContentId) {
      const firstItem = content[0]
      setCurrentContentId(firstItem.id)
      startFocus(firstItem.id, firstItem.theme)
    }
  }, [content, currentContentId, startFocus])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-base via-elevated to-base">
      {/* Phone mockup with content view */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {useNativeApp ? (
          /* React Native Web app embedded in PhoneMockup via iframe */
          <PhoneMockup>
            <iframe
              src={RN_WEB_URL}
              title="GAVIGO IRE Mobile App"
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; microphone; clipboard-read; clipboard-write"
            />
          </PhoneMockup>
        ) : content.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <StreamIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        ) : (
          /* Fallback: existing CSS-based TikTok view in PhoneMockup */
          <PhoneMockup>
            <TikTokContentView
              content={content}
              containerStates={containerStates}
              onActivate={handleActivate}
              onContentChange={handleContentChange}
            />
          </PhoneMockup>
        )}
      </div>
    </div>
  )
}

import { useRef, useEffect, useCallback, useState } from 'react';
import { ContentCard } from './ContentCard';
import { useEngagement } from '../../hooks/useEngagement';
import type {
  ContentItem,
  ContainerStatus,
  FocusEventPayload,
  ScrollUpdatePayload,
  ActivationRequestPayload,
} from '../../types';

interface MediaStreamProps {
  content: ContentItem[];
  containerStates: Record<string, ContainerStatus>;
  onFocusEvent: (payload: FocusEventPayload) => void;
  onScrollUpdate: (payload: ScrollUpdatePayload) => void;
  onActivationRequest: (payload: ActivationRequestPayload) => void;
}

export function MediaStream({
  content,
  containerStates,
  onFocusEvent,
  onScrollUpdate,
  onActivationRequest,
}: MediaStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedContentId, setFocusedContentId] = useState<string | null>(null);
  const [visibleContent, setVisibleContent] = useState<string[]>([]);
  const lastScrollPosition = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const { startFocus, endFocus, createVisibilityObserver } = useEngagement({
    onFocusEvent,
    reportIntervalMs: 1000,
  });

  // Track scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const now = Date.now();
    const timeDiff = now - lastScrollTime.current;
    const scrollTop = containerRef.current.scrollTop;
    const scrollDiff = scrollTop - lastScrollPosition.current;
    const velocity = timeDiff > 0 ? scrollDiff / timeDiff : 0;

    onScrollUpdate({
      position: scrollTop,
      velocity,
      visible_content: visibleContent,
    });

    lastScrollPosition.current = scrollTop;
    lastScrollTime.current = now;
  }, [onScrollUpdate, visibleContent]);

  // Set up visibility observer
  useEffect(() => {
    const observer = createVisibilityObserver((contentId, theme, isVisible) => {
      if (isVisible) {
        setVisibleContent((prev) => {
          if (!prev.includes(contentId)) {
            return [...prev, contentId];
          }
          return prev;
        });
        // Auto-start focus on visible content
        if (!focusedContentId) {
          setFocusedContentId(contentId);
          startFocus(contentId, theme);
        }
      } else {
        setVisibleContent((prev) => prev.filter((id) => id !== contentId));
        if (focusedContentId === contentId) {
          endFocus();
          setFocusedContentId(null);
        }
      }
    });

    // Observe all content cards
    const cards = document.querySelectorAll('[data-content-id]');
    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, [content, createVisibilityObserver, startFocus, endFocus, focusedContentId]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleMouseEnter = useCallback(
    (contentId: string, theme: string) => {
      setFocusedContentId(contentId);
      startFocus(contentId, theme);
    },
    [startFocus]
  );

  const handleMouseLeave = useCallback(() => {
    endFocus();
    setFocusedContentId(null);
  }, [endFocus]);

  const handleActivate = useCallback(
    (contentId: string) => {
      onActivationRequest({ content_id: contentId });
    },
    [onActivationRequest]
  );

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Mixed Media Stream</h2>
        <p className="text-gray-500 text-sm">
          Scroll and interact to trigger AI recommendations
        </p>
      </div>

      {/* Content stream */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
      >
        {content.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Loading content...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
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

      {/* Footer with stats */}
      <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {content.length} items | {visibleContent.length} visible
          </span>
          {focusedContentId && (
            <span className="text-blue-400">
              Focused: {focusedContentId.slice(0, 12)}...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

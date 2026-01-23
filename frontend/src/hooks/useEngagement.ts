import { useRef, useCallback, useEffect } from 'react';
import type { FocusEventPayload } from '../types';

interface UseEngagementOptions {
  onFocusEvent: (payload: FocusEventPayload) => void;
  reportIntervalMs?: number;
}

interface FocusState {
  contentId: string;
  theme: string;
  startTime: number;
  totalTime: number;
}

export function useEngagement(options: UseEngagementOptions) {
  const { onFocusEvent, reportIntervalMs = 1000 } = options;

  const focusStateRef = useRef<FocusState | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Start tracking focus on a content item
  const startFocus = useCallback((contentId: string, theme: string) => {
    // If already focused on this content, do nothing
    if (focusStateRef.current?.contentId === contentId) return;

    // Report previous focus if any
    if (focusStateRef.current) {
      reportFocus();
    }

    focusStateRef.current = {
      contentId,
      theme,
      startTime: Date.now(),
      totalTime: 0,
    };
  }, []);

  // End focus tracking
  const endFocus = useCallback(() => {
    if (focusStateRef.current) {
      reportFocus();
      focusStateRef.current = null;
    }
  }, []);

  // Report current focus state
  const reportFocus = useCallback(() => {
    if (!focusStateRef.current) return;

    const now = Date.now();
    const duration = now - focusStateRef.current.startTime + focusStateRef.current.totalTime;

    if (duration > 0) {
      onFocusEvent({
        content_id: focusStateRef.current.contentId,
        duration_ms: duration,
        theme: focusStateRef.current.theme,
      });
    }

    // Reset timer but keep tracking
    focusStateRef.current.startTime = now;
    focusStateRef.current.totalTime = 0;
  }, [onFocusEvent]);

  // Set up periodic reporting
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      if (focusStateRef.current) {
        reportFocus();
      }
    }, reportIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Report final focus on unmount
      if (focusStateRef.current) {
        reportFocus();
      }
    };
  }, [reportIntervalMs, reportFocus]);

  // Track visibility of content items using Intersection Observer
  // Optimized for lookahead detection - triggers before content fully enters viewport
  const createVisibilityObserver = useCallback((
    onVisibilityChange: (contentId: string, theme: string, isVisible: boolean) => void
  ) => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const contentId = entry.target.getAttribute('data-content-id');
          const theme = entry.target.getAttribute('data-theme');
          if (contentId && theme) {
            onVisibilityChange(contentId, theme, entry.isIntersecting);
          }
        });
      },
      {
        threshold: 0.1, // Lowered to 10% - trigger earlier for proactive warming
        rootMargin: '200px 0px 200px 0px', // Detect 200px before entering viewport
      }
    );
  }, []);

  return {
    startFocus,
    endFocus,
    reportFocus,
    createVisibilityObserver,
  };
}

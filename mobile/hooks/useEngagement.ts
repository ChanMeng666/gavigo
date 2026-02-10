import { useRef, useCallback, useEffect } from 'react';
import type { FocusEventPayload } from '@/types';

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFocusEventRef = useRef(onFocusEvent);
  onFocusEventRef.current = onFocusEvent;

  const reportFocus = useCallback(() => {
    if (!focusStateRef.current) return;

    const now = Date.now();
    const duration =
      now - focusStateRef.current.startTime + focusStateRef.current.totalTime;

    if (duration > 0) {
      onFocusEventRef.current({
        content_id: focusStateRef.current.contentId,
        duration_ms: duration,
        theme: focusStateRef.current.theme,
      });
    }

    focusStateRef.current.startTime = now;
    focusStateRef.current.totalTime = 0;
  }, []);

  const startFocus = useCallback(
    (contentId: string, theme: string) => {
      if (focusStateRef.current?.contentId === contentId) return;

      if (focusStateRef.current) {
        reportFocus();
      }

      focusStateRef.current = {
        contentId,
        theme,
        startTime: Date.now(),
        totalTime: 0,
      };
    },
    [reportFocus]
  );

  const endFocus = useCallback(() => {
    if (focusStateRef.current) {
      reportFocus();
      focusStateRef.current = null;
    }
  }, [reportFocus]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (focusStateRef.current) {
        reportFocus();
      }
    }, reportIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (focusStateRef.current) {
        reportFocus();
      }
    };
  }, [reportIntervalMs, reportFocus]);

  return {
    startFocus,
    endFocus,
    reportFocus,
  };
}

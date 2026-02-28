import { create } from 'zustand';
import { appStorage } from '@/services/storage';
import type {
  ContentItem,
  ContainerStatus,
  OperationalMode,
  InputScores,
  AIDecision,
  ResourceAllocation,
} from '@/types';
import type { Video } from '@/types/supabase';

const CACHE_KEY = 'feed-cache';

interface FeedState {
  sessionId: string | null;
  connected: boolean;
  currentMode: OperationalMode;
  content: ContentItem[];
  containerStates: Record<string, ContainerStatus>;
  scores: Record<string, InputScores>;
  decisions: AIDecision[];
  resources: ResourceAllocation | null;
  activeContentId: string | null;
  currentIndex: number;

  // Supabase video feed
  videos: Video[];
  videosPage: number;
  videosLoading: boolean;
  videosHasMore: boolean;

  setSessionId: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  setContent: (content: ContentItem[]) => void;
  setContainerStates: (states: Record<string, ContainerStatus>) => void;
  updateContainerState: (contentId: string, status: ContainerStatus) => void;
  updateScore: (contentId: string, scores: InputScores) => void;
  setCurrentMode: (mode: OperationalMode) => void;
  addDecision: (decision: AIDecision) => void;
  setResources: (resources: ResourceAllocation) => void;
  setActiveContentId: (id: string | null) => void;
  setCurrentIndex: (index: number) => void;
  injectContent: (content: ContentItem, position: number) => void;
  setVideos: (videos: Video[]) => void;
  appendVideos: (videos: Video[]) => void;
  setVideosPage: (page: number) => void;
  setVideosLoading: (loading: boolean) => void;
  setVideosHasMore: (hasMore: boolean) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>()(
  (set) => ({
    sessionId: null,
    connected: false,
    currentMode: 'MIXED_STREAM_BROWSING',
    content: [],
    containerStates: {},
    scores: {},
    decisions: [],
    resources: null,
    activeContentId: null,
    currentIndex: 0,
    videos: [],
    videosPage: 1,
    videosLoading: false,
    videosHasMore: true,

    setSessionId: (id) => set({ sessionId: id }),
    setConnected: (connected) => set({ connected }),
    setContent: (content) => set({ content }),
    setContainerStates: (states) => set({ containerStates: states }),

    updateContainerState: (contentId, status) =>
      set((state) => ({
        containerStates: { ...state.containerStates, [contentId]: status },
      })),

    updateScore: (contentId, scores) =>
      set((state) => ({
        scores: { ...state.scores, [contentId]: scores },
      })),

    setCurrentMode: (mode) => set({ currentMode: mode }),

    addDecision: (decision) =>
      set((state) => ({
        decisions: [decision, ...state.decisions].slice(0, 100),
      })),

    setResources: (resources) => set({ resources }),
    setActiveContentId: (id) => set({ activeContentId: id }),
    setCurrentIndex: (index) => set({ currentIndex: index }),

    injectContent: (content, position) =>
      set((state) => {
        const newContent = [...state.content];
        const safePos = Math.min(position, newContent.length);
        newContent.splice(safePos, 0, content);
        return { content: newContent };
      }),

    setVideos: (videos) => set({ videos }),
    appendVideos: (videos) =>
      set((state) => ({ videos: [...state.videos, ...videos] })),
    setVideosPage: (page) => set({ videosPage: page }),
    setVideosLoading: (loading) => set({ videosLoading: loading }),
    setVideosHasMore: (hasMore) => set({ videosHasMore: hasMore }),

    reset: () =>
      set({
        content: [],
        containerStates: {},
        scores: {},
        decisions: [],
        resources: null,
        activeContentId: null,
        currentIndex: 0,
        currentMode: 'MIXED_STREAM_BROWSING',
        videos: [],
        videosPage: 1,
        videosHasMore: true,
      }),
  })
);

// --- Manual persist (avoids zustand/middleware which bundles devtools with import.meta) ---

// Hydrate cached videos on startup
try {
  const cached = appStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed?.videos && Array.isArray(parsed.videos) && parsed.videos.length > 0) {
      useFeedStore.setState({ videos: parsed.videos });
    }
  }
} catch {
  // Ignore parse errors
}

// Persist videos whenever they change
useFeedStore.subscribe((state, prev) => {
  if (state.videos !== prev.videos) {
    try {
      appStorage.setItem(CACHE_KEY, JSON.stringify({ videos: state.videos }));
    } catch {
      // Ignore write errors
    }
  }
});

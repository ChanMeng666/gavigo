import { create } from 'zustand';
import type {
  ContentItem,
  ContainerStatus,
  OperationalMode,
  InputScores,
  AIDecision,
  ResourceAllocation,
} from '@/types';

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
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
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
    }),
}));

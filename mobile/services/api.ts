import { Platform } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import type {
  ContentItem,
  AIDecision,
  ResourceAllocation,
  ContainerStatus,
  OperationalMode,
  UserProfile,
  Comment,
} from '@/types';

function getBaseUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // On web, use same origin (nginx proxies /api/ to orchestrator)
    return `${window.location.origin}/api/v1`;
  }
  // On native
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'http://localhost:8080/api/v1';
  }
  return 'http://129.212.209.146/api/v1';
}

const API_BASE = getBaseUrl();

interface HealthResponse {
  status: string;
  redis: string;
  kubernetes: string;
}

interface ContainersResponse {
  [contentId: string]: {
    content_id: string;
    status: ContainerStatus;
    deployment_name: string;
    replicas: number;
    ready_replicas: number;
    last_state_change: string;
  };
}

interface ScoresResponse {
  [contentId: string]: {
    personal_score: number;
    global_score: number;
    combined_score: number;
    threshold_exceeded: boolean;
  };
}

interface ModeResponse {
  current_mode: OperationalMode;
  active_content_id: string | null;
  since: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().idToken;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Health check
  health: () => fetchJson<HealthResponse>(`${API_BASE}/health`),

  // Content
  getContent: () => fetchJson<ContentItem[]>(`${API_BASE}/content`),
  getContentItem: (contentId: string) =>
    fetchJson<ContentItem>(`${API_BASE}/content/${contentId}`),

  // Containers
  getContainers: () => fetchJson<ContainersResponse>(`${API_BASE}/containers`),

  // Decisions
  getDecisions: (limit = 50) =>
    fetchJson<AIDecision[]>(`${API_BASE}/decisions?limit=${limit}`),

  // Scores
  getScores: () => fetchJson<ScoresResponse>(`${API_BASE}/scores`),

  // Mode
  getMode: () => fetchJson<ModeResponse>(`${API_BASE}/mode`),

  // Resources
  getResources: () => fetchJson<ResourceAllocation>(`${API_BASE}/resources`),

  // Demo controls
  resetDemo: () =>
    fetchJson<{ message: string }>(`${API_BASE}/demo/reset`, {
      method: 'POST',
    }),

  triggerTrendSpike: (contentId: string, viralScore: number) =>
    fetchJson<{ content_id: string; new_viral_score: number }>(
      `${API_BASE}/demo/trend-spike`,
      {
        method: 'POST',
        body: JSON.stringify({
          content_id: contentId,
          viral_score: viralScore,
        }),
      }
    ),

  // User profile
  getProfile: () => fetchJson<UserProfile>(`${API_BASE}/users/me`),
  updateProfile: (data: Partial<UserProfile>) =>
    fetchJson<UserProfile>(`${API_BASE}/users/profile`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Social - Likes
  likeContent: (contentId: string) =>
    fetchJson<{ liked: boolean; count: number }>(
      `${API_BASE}/content/${contentId}/like`,
      { method: 'POST' }
    ),
  unlikeContent: (contentId: string) =>
    fetchJson<{ liked: boolean; count: number }>(
      `${API_BASE}/content/${contentId}/like`,
      { method: 'DELETE' }
    ),

  // Social - Comments
  getComments: (contentId: string) =>
    fetchJson<Comment[]>(`${API_BASE}/content/${contentId}/comments`),
  postComment: (contentId: string, text: string) =>
    fetchJson<Comment>(`${API_BASE}/content/${contentId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Social - Follow
  followUser: (userId: string) =>
    fetchJson<{ following: boolean }>(`${API_BASE}/users/${userId}/follow`, {
      method: 'POST',
    }),
  unfollowUser: (userId: string) =>
    fetchJson<{ following: boolean }>(`${API_BASE}/users/${userId}/follow`, {
      method: 'DELETE',
    }),
};

export function getApiBase(): string {
  return API_BASE.replace('/api/v1', '');
}

export function getWsUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  const base = getApiBase();
  return base.replace(/^http/, 'ws') + '/ws';
}

export default api;

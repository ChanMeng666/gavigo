import type {
  ContentItem,
  AIDecision,
  ResourceAllocation,
  ContainerStatus,
  OperationalMode,
} from '../types';

const API_BASE = '/api/v1';

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

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
};

export default api;

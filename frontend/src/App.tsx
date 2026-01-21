import { useState, useCallback, useEffect } from 'react';
import { Dashboard } from './components/dashboard';
import { MediaStream, FullScreenView } from './components/stream';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';
import type {
  ContentItem,
  ContainerStatus,
  OperationalMode,
  AIDecision,
  InputScores,
  ResourceAllocation,
  ConnectionEstablishedPayload,
  ContainerStateChangePayload,
  ScoreUpdatePayload,
  ModeChangePayload,
  StreamInjectPayload,
  ActivationReadyPayload,
  DemoControlPayload,
  FocusEventPayload,
  ScrollUpdatePayload,
  ActivationRequestPayload,
} from './types';

type ViewMode = 'split' | 'stream' | 'dashboard';

function App() {
  // Application state
  const [content, setContent] = useState<ContentItem[]>([]);
  const [containerStates, setContainerStates] = useState<Record<string, ContainerStatus>>({});
  const [currentMode, setCurrentMode] = useState<OperationalMode>('MIXED_STREAM_BROWSING');
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [scores, setScores] = useState<Record<string, InputScores>>({});
  const [resourceHistory, setResourceHistory] = useState<ResourceAllocation[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [fullScreenContent, setFullScreenContent] = useState<ContentItem | null>(null);

  // WebSocket connection
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

  const handleConnectionEstablished = useCallback((payload: ConnectionEstablishedPayload) => {
    console.log('Connection established:', payload);
    setContent(payload.initial_content);
    setContainerStates(payload.container_states);
    setCurrentMode(payload.current_mode);
  }, []);

  const handleDecisionMade = useCallback((decision: AIDecision) => {
    console.log('Decision made:', decision);
    setDecisions((prev) => [decision, ...prev].slice(0, 100));
  }, []);

  const handleContainerStateChange = useCallback((payload: ContainerStateChangePayload) => {
    console.log('Container state change:', payload);
    setContainerStates((prev) => ({
      ...prev,
      [payload.content_id]: payload.new_state,
    }));

    // Update content item status
    setContent((prev) =>
      prev.map((item) =>
        item.id === payload.content_id
          ? { ...item, container_status: payload.new_state }
          : item
      )
    );
  }, []);

  const handleScoreUpdate = useCallback((payload: ScoreUpdatePayload) => {
    setScores((prev) => ({
      ...prev,
      [payload.content_id]: {
        personal_score: payload.personal_score,
        global_score: payload.global_score,
        combined_score: payload.combined_score,
      },
    }));

    // Update content item scores
    setContent((prev) =>
      prev.map((item) =>
        item.id === payload.content_id
          ? {
              ...item,
              personal_score: payload.personal_score,
              global_score: payload.global_score,
              combined_score: payload.combined_score,
            }
          : item
      )
    );
  }, []);

  const handleModeChange = useCallback((payload: ModeChangePayload) => {
    console.log('Mode change:', payload);
    setCurrentMode(payload.new_mode);
  }, []);

  const handleStreamInject = useCallback((payload: StreamInjectPayload) => {
    console.log('Stream inject:', payload);
    setContent((prev) => {
      const newContent = [...prev];
      newContent.splice(payload.insert_position, 0, payload.content);
      return newContent;
    });
  }, []);

  const handleResourceUpdate = useCallback((allocation: ResourceAllocation) => {
    setResourceHistory((prev) => [...prev, allocation].slice(-60));
  }, []);

  const handleActivationReady = useCallback((payload: ActivationReadyPayload) => {
    console.log('Activation ready:', payload);
    setActiveContentId(payload.content_id);

    // Find the content and show full screen view
    setContent((prev) => {
      const item = prev.find((c) => c.id === payload.content_id);
      if (item) {
        setFullScreenContent({ ...item, container_status: payload.status });
      }
      return prev;
    });
  }, []);

  const {
    connected,
    sessionId,
    sendScrollUpdate,
    sendFocusEvent,
    sendActivationRequest,
    sendDeactivation,
    sendDemoControl,
  } = useWebSocket({
    url: wsUrl,
    onConnectionEstablished: handleConnectionEstablished,
    onDecisionMade: handleDecisionMade,
    onContainerStateChange: handleContainerStateChange,
    onScoreUpdate: handleScoreUpdate,
    onModeChange: handleModeChange,
    onStreamInject: handleStreamInject,
    onResourceUpdate: handleResourceUpdate,
    onActivationReady: handleActivationReady,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [contentData, decisionsData, resourceData] = await Promise.all([
          api.getContent(),
          api.getDecisions(50),
          api.getResources(),
        ]);
        setContent(contentData);
        setDecisions(decisionsData);
        setResourceHistory([resourceData]);

        // Initialize container states
        const states: Record<string, ContainerStatus> = {};
        contentData.forEach((item) => {
          states[item.id] = item.container_status;
        });
        setContainerStates(states);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Periodic resource updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const resourceData = await api.getResources();
        setResourceHistory((prev) => [...prev, resourceData].slice(-60));
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDemoControl = useCallback(
    (payload: DemoControlPayload) => {
      sendDemoControl(payload);
    },
    [sendDemoControl]
  );

  const handleResetDemo = useCallback(async () => {
    try {
      await api.resetDemo();
      // Reset local state
      setDecisions([]);
      setScores({});
      setResourceHistory([]);
      setCurrentMode('MIXED_STREAM_BROWSING');
      setActiveContentId(null);
      setFullScreenContent(null);
      // Refetch content
      const contentData = await api.getContent();
      setContent(contentData);
      const states: Record<string, ContainerStatus> = {};
      contentData.forEach((item) => {
        states[item.id] = item.container_status;
      });
      setContainerStates(states);
    } catch (error) {
      console.error('Error resetting demo:', error);
    }
  }, []);

  const handleFocusEvent = useCallback(
    (payload: FocusEventPayload) => {
      sendFocusEvent(payload);
    },
    [sendFocusEvent]
  );

  const handleScrollUpdate = useCallback(
    (payload: ScrollUpdatePayload) => {
      sendScrollUpdate(payload);
    },
    [sendScrollUpdate]
  );

  const handleActivationRequest = useCallback(
    (payload: ActivationRequestPayload) => {
      sendActivationRequest(payload);
      // Immediately show loading state
      const item = content.find((c) => c.id === payload.content_id);
      if (item) {
        setFullScreenContent(item);
        setActiveContentId(payload.content_id);
      }
    },
    [sendActivationRequest, content]
  );

  const handleDeactivate = useCallback(() => {
    if (activeContentId) {
      sendDeactivation(activeContentId);
    }
    setFullScreenContent(null);
    setActiveContentId(null);
  }, [sendDeactivation, activeContentId]);

  return (
    <div className="h-screen bg-gray-950 overflow-hidden">
      {/* Full screen view when content is activated */}
      {fullScreenContent && (
        <FullScreenView
          content={fullScreenContent}
          containerStatus={containerStates[fullScreenContent.id] || fullScreenContent.container_status}
          onDeactivate={handleDeactivate}
        />
      )}

      {/* View mode toggle */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-gray-900 rounded-lg p-1">
        <button
          onClick={() => setViewMode('split')}
          className={`px-3 py-1 rounded text-sm ${
            viewMode === 'split' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Split
        </button>
        <button
          onClick={() => setViewMode('stream')}
          className={`px-3 py-1 rounded text-sm ${
            viewMode === 'stream' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Stream
        </button>
        <button
          onClick={() => setViewMode('dashboard')}
          className={`px-3 py-1 rounded text-sm ${
            viewMode === 'dashboard' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
      </div>

      {/* Main layout */}
      <div className="h-full flex">
        {/* Media Stream */}
        {(viewMode === 'split' || viewMode === 'stream') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/3 border-r border-gray-800' : 'w-full'
            } h-full`}
          >
            <MediaStream
              content={content}
              containerStates={containerStates}
              onFocusEvent={handleFocusEvent}
              onScrollUpdate={handleScrollUpdate}
              onActivationRequest={handleActivationRequest}
            />
          </div>
        )}

        {/* Dashboard */}
        {(viewMode === 'split' || viewMode === 'dashboard') && (
          <div className={`${viewMode === 'split' ? 'w-2/3' : 'w-full'} h-full overflow-auto`}>
            <Dashboard
              connected={connected}
              sessionId={sessionId}
              content={content}
              containerStates={containerStates}
              currentMode={currentMode}
              activeContentId={activeContentId}
              decisions={decisions}
              scores={scores}
              resourceHistory={resourceHistory}
              onDemoControl={handleDemoControl}
              onResetDemo={handleResetDemo}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

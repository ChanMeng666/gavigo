import { useState, useCallback, useEffect } from "react"
import { Dashboard } from "./components/dashboard"
import { MediaStream } from "./components/stream"
import { AppShell, AppShellMain, Header } from "./components/layout"
import type { ViewMode } from "./components/layout/ViewToggle"
import { useWebSocket } from "./hooks/useWebSocket"
import { useIsMobile } from "./hooks/useMediaQuery"
import { api } from "./services/api"
import type {
  ContentItem,
  ContainerStatus,
  OperationalMode,
  AIDecision,
  InputScores,
  ResourceAllocation,
  ActivationSpineEvent,
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
  SocialEvent,
  EngagementSummary,
  UserActivityEvent,
} from "./types"

function App() {
  // Application state
  const [content, setContent] = useState<ContentItem[]>([])
  const [containerStates, setContainerStates] = useState<Record<string, ContainerStatus>>({})
  const [currentMode, setCurrentMode] = useState<OperationalMode>("MIXED_STREAM_BROWSING")
  const [activeContentId, setActiveContentId] = useState<string | null>(null)
  const [decisions, setDecisions] = useState<AIDecision[]>([])
  const [scores, setScores] = useState<Record<string, InputScores>>({})
  const [resourceHistory, setResourceHistory] = useState<ResourceAllocation[]>([])
  const [activationSpine, setActivationSpine] = useState<ActivationSpineEvent[]>([])
  const [socialEvents, setSocialEvents] = useState<SocialEvent[]>([])
  const [engagement, setEngagement] = useState<EngagementSummary | null>(null)
  const [userActivities, setUserActivities] = useState<UserActivityEvent[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("split")

  // Responsive
  const isMobile = useIsMobile()

  // Auto-switch to stream view on mobile
  useEffect(() => {
    if (isMobile && viewMode === "split") {
      setViewMode("stream")
    }
  }, [isMobile])

  // WebSocket connection
  const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`

  const handleConnectionEstablished = useCallback((payload: ConnectionEstablishedPayload) => {
    console.log("Connection established:", payload)
    setContent(payload.initial_content)
    setContainerStates(payload.container_states)
    setCurrentMode(payload.current_mode)
  }, [])

  const handleDecisionMade = useCallback((decision: AIDecision) => {
    console.log("Decision made:", decision)
    setDecisions((prev) => [decision, ...prev].slice(0, 100))
  }, [])

  const handleContainerStateChange = useCallback((payload: ContainerStateChangePayload) => {
    console.log("Container state change:", payload)
    setContainerStates((prev) => ({
      ...prev,
      [payload.content_id]: payload.new_state,
    }))

    // Update content item status
    setContent((prev) =>
      prev.map((item) =>
        item.id === payload.content_id
          ? { ...item, container_status: payload.new_state }
          : item
      )
    )
  }, [])

  const handleScoreUpdate = useCallback((payload: ScoreUpdatePayload) => {
    setScores((prev) => ({
      ...prev,
      [payload.content_id]: {
        personal_score: payload.personal_score,
        global_score: payload.global_score,
        combined_score: payload.combined_score,
      },
    }))

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
    )
  }, [])

  const handleModeChange = useCallback((payload: ModeChangePayload) => {
    console.log("Mode change:", payload)
    setCurrentMode(payload.new_mode)
  }, [])

  const handleStreamInject = useCallback((payload: StreamInjectPayload) => {
    console.log("Stream inject:", payload)
    setContent((prev) => {
      const newContent = [...prev]
      newContent.splice(payload.insert_position, 0, payload.content)
      return newContent
    })
  }, [])

  const handleResourceUpdate = useCallback((allocation: ResourceAllocation) => {
    setResourceHistory((prev) => [...prev, allocation].slice(-60))
  }, [])

  const handleActivationReady = useCallback((payload: ActivationReadyPayload) => {
    console.log("Activation ready:", payload)
    setActiveContentId(payload.content_id)
  }, [])

  const handleActivationSpine = useCallback((event: ActivationSpineEvent) => {
    setActivationSpine((prev) => [event, ...prev].slice(0, 200))
  }, [])

  const handleSocialEvent = useCallback((event: SocialEvent) => {
    setSocialEvents((prev) => [event, ...prev].slice(0, 100))
  }, [])

  const handleEngagementUpdate = useCallback((summary: EngagementSummary) => {
    setEngagement(summary)
  }, [])

  const handleUserActivity = useCallback((event: UserActivityEvent) => {
    setUserActivities((prev) => [event, ...prev].slice(0, 200))
  }, [])

  const {
    connected,
    sessionId,
    sendScrollUpdate,
    sendFocusEvent,
    sendActivationRequest,
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
    onActivationSpine: handleActivationSpine,
    onSocialEvent: handleSocialEvent,
    onEngagementUpdate: handleEngagementUpdate,
    onUserActivity: handleUserActivity,
  })

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [contentData, decisionsData, resourceData] = await Promise.all([
          api.getContent(),
          api.getDecisions(50),
          api.getResources(),
        ])
        setContent(contentData)
        setDecisions(decisionsData)
        setResourceHistory([resourceData])

        // Initialize container states
        const states: Record<string, ContainerStatus> = {}
        contentData.forEach((item) => {
          states[item.id] = item.container_status
        })
        setContainerStates(states)
      } catch (error) {
        console.error("Error fetching initial data:", error)
      }
    }

    fetchInitialData()
  }, [])

  // Periodic resource updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const resourceData = await api.getResources()
        setResourceHistory((prev) => [...prev, resourceData].slice(-60))
      } catch (error) {
        console.error("Error fetching resources:", error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleDemoControl = useCallback(
    (payload: DemoControlPayload) => {
      sendDemoControl(payload)
    },
    [sendDemoControl]
  )

  const handleResetDemo = useCallback(async () => {
    try {
      await api.resetDemo()
      // Reset local state
      setDecisions([])
      setScores({})
      setResourceHistory([])
      setActivationSpine([])
      setSocialEvents([])
      setEngagement(null)
      setUserActivities([])
      setCurrentMode("MIXED_STREAM_BROWSING")
      setActiveContentId(null)
      // Refetch content
      const contentData = await api.getContent()
      setContent(contentData)
      const states: Record<string, ContainerStatus> = {}
      contentData.forEach((item) => {
        states[item.id] = item.container_status
      })
      setContainerStates(states)
    } catch (error) {
      console.error("Error resetting demo:", error)
    }
  }, [])

  const handleFocusEvent = useCallback(
    (payload: FocusEventPayload) => {
      sendFocusEvent(payload)
    },
    [sendFocusEvent]
  )

  const handleScrollUpdate = useCallback(
    (payload: ScrollUpdatePayload) => {
      sendScrollUpdate(payload)
    },
    [sendScrollUpdate]
  )

  const handleActivationRequest = useCallback(
    (payload: ActivationRequestPayload) => {
      sendActivationRequest(payload)
      setActiveContentId(payload.content_id)
    },
    [sendActivationRequest]
  )

  return (
    <AppShell>
      {/* Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        connected={connected}
        sessionId={sessionId ?? undefined}
      />

      {/* Main layout */}
      <AppShellMain>
        <div className="h-full flex">
          {/* Media Stream */}
          {(viewMode === "split" || viewMode === "stream") && (
            <div
              className={
                viewMode === "split"
                  ? "w-full lg:w-1/3 lg:border-r border-border"
                  : "w-full"
              }
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
          {(viewMode === "split" || viewMode === "dashboard") && (
            <div
              className={
                viewMode === "split"
                  ? "hidden lg:block lg:w-2/3"
                  : "w-full"
              }
            >
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
                activationSpine={activationSpine}
                socialEvents={socialEvents}
                engagement={engagement}
                userActivities={userActivities}
                onDemoControl={handleDemoControl}
                onResetDemo={handleResetDemo}
              />
            </div>
          )}
        </div>
      </AppShellMain>
    </AppShell>
  )
}

export default App

import { ActivationTimeline } from "./ActivationTimeline"
import { AIDecisionLog } from "./AIDecisionLog"
import { ScoreDisplay } from "./ScoreDisplay"
import { ModeIndicator } from "./ModeIndicator"
import { ServiceStatus } from "./ServiceStatus"
import { WorkloadStatus } from "./WorkloadStatus"
import { ResourceChart } from "./ResourceChart"
import { DemoControls } from "./DemoControls"
import { ScrollArea } from "@/components/ui/scroll-area"
import type {
  ContentItem,
  ContainerStatus as ContainerStatusType,
  OperationalMode,
  AIDecision,
  InputScores,
  ResourceAllocation,
  ActivationSpineEvent,
  DemoControlPayload,
} from "@/types"

interface DashboardProps {
  connected: boolean
  sessionId: string | null
  content: ContentItem[]
  containerStates: Record<string, ContainerStatusType>
  currentMode: OperationalMode
  activeContentId: string | null
  decisions: AIDecision[]
  scores: Record<string, InputScores>
  resourceHistory: ResourceAllocation[]
  activationSpine: ActivationSpineEvent[]
  onDemoControl: (payload: DemoControlPayload) => void
  onResetDemo: () => void
}

export function Dashboard({
  content,
  containerStates,
  currentMode,
  activeContentId,
  decisions,
  scores,
  resourceHistory,
  activationSpine,
  onDemoControl,
  onResetDemo,
}: DashboardProps) {
  const contentTitles = content.reduce(
    (acc, item) => ({ ...acc, [item.id]: item.title }),
    {} as Record<string, string>
  )

  return (
    <div className="h-full flex flex-col bg-base">
      <ScrollArea className="flex-1">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* TOP: Activation Spine Timeline (full width hero) */}
          <ActivationTimeline
            events={activationSpine}
            contentTitles={contentTitles}
          />

          {/* BOTTOM: 3-column detail grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column - Mode, Service Status, Workload Status */}
            <div className="md:col-span-1 xl:col-span-3 space-y-4">
              <ModeIndicator
                currentMode={currentMode}
                activeContentId={activeContentId}
              />
              <ServiceStatus />
              <WorkloadStatus content={content} containerStates={containerStates} />
            </div>

            {/* Center Column - Decision Log */}
            <div className="md:col-span-1 xl:col-span-5">
              <div className="h-[calc(100vh-180px)] min-h-[400px]">
                <AIDecisionLog decisions={decisions} maxItems={30} />
              </div>
            </div>

            {/* Right Column - Scores, Resources, Demo Controls */}
            <div className="md:col-span-2 xl:col-span-4 space-y-4">
              <ScoreDisplay scores={scores} contentTitles={contentTitles} />
              <ResourceChart history={resourceHistory} />
              <DemoControls
                content={content}
                onDemoControl={onDemoControl}
                onResetDemo={onResetDemo}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default Dashboard

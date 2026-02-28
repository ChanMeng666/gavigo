import { ActivationTimeline } from "./ActivationTimeline"
import { AIDecisionLog } from "./AIDecisionLog"
import { ScoreDisplay } from "./ScoreDisplay"
import { ModeIndicator } from "./ModeIndicator"
import { ServiceStatus } from "./ServiceStatus"
import { WorkloadStatus } from "./WorkloadStatus"
import { ResourceChart } from "./ResourceChart"
import { DemoControls } from "./DemoControls"
import { SocialActivityFeed } from "./SocialActivityFeed"
import { UserEngagement } from "./UserEngagement"
import { UserJourney } from "./UserJourney"
import { ScreenDistribution } from "./ScreenDistribution"
import { TelemetryPanel } from "./TelemetryPanel"
import { ProofSignalLog } from "./ProofSignalLog"
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
  SocialEvent,
  EngagementSummary,
  UserActivityEvent,
  ProofSignalEvent,
  TelemetrySnapshot,
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
  socialEvents: SocialEvent[]
  engagement: EngagementSummary | null
  userActivities: UserActivityEvent[]
  proofSignals: ProofSignalEvent[]
  telemetrySnapshots: Record<string, TelemetrySnapshot>
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
  socialEvents,
  engagement,
  userActivities,
  proofSignals,
  telemetrySnapshots,
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
            telemetrySnapshots={telemetrySnapshots}
          />

          {/* Telemetry Panel (full width) */}
          <TelemetryPanel
            telemetrySnapshots={telemetrySnapshots}
            proofSignals={proofSignals}
            contentTitles={contentTitles}
          />

          {/* Proof Signal Event Log (full width) */}
          <ProofSignalLog
            proofSignals={proofSignals}
            contentTitles={contentTitles}
          />

          {/* User Journey Timeline (full width) */}
          <UserJourney
            userActivities={userActivities}
            socialEvents={socialEvents}
          />

          {/* 2-column detail grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">

            {/* Row 1 Left — Mode + Services */}
            <div className="space-y-4 min-w-0">
              <ModeIndicator
                currentMode={currentMode}
                activeContentId={activeContentId}
              />
              <ServiceStatus />
            </div>

            {/* Row 1 Right — Game Workloads */}
            <div className="min-w-0">
              <WorkloadStatus content={content} containerStates={containerStates} telemetrySnapshots={telemetrySnapshots} />
            </div>

            {/* Row 2 Left — User Engagement + Screen Distribution */}
            <div className="space-y-4 min-w-0">
              <UserEngagement engagement={engagement} />
              <ScreenDistribution userActivities={userActivities} />
            </div>

            {/* Row 2 Right — Social Activity Feed */}
            <div className="min-w-0 min-h-[300px]">
              <SocialActivityFeed
                events={socialEvents}
                contentTitles={contentTitles}
              />
            </div>

            {/* Row 3 Left — AI Decision Log */}
            <div className="min-w-0 min-h-[400px]">
              <AIDecisionLog decisions={decisions} maxItems={30} />
            </div>

            {/* Row 3 Right — Scores + Resources */}
            <div className="space-y-4 min-w-0">
              <ScoreDisplay scores={scores} contentTitles={contentTitles} />
              <ResourceChart history={resourceHistory} />
            </div>

            {/* Row 4 — Demo Controls (full width) */}
            <div className="md:col-span-2">
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

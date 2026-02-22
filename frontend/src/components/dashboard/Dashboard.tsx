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

          {/* User Journey Timeline (full width) */}
          <UserJourney
            userActivities={userActivities}
            socialEvents={socialEvents}
          />

          {/* 3-column detail grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column - Mode, Service Status, Engagement, Workload */}
            <div className="md:col-span-1 xl:col-span-3 space-y-4">
              <ModeIndicator
                currentMode={currentMode}
                activeContentId={activeContentId}
              />
              <ServiceStatus />
              <UserEngagement engagement={engagement} />
              <WorkloadStatus content={content} containerStates={containerStates} />
            </div>

            {/* Center Column - AI Decisions + Social Feed */}
            <div className="md:col-span-1 xl:col-span-5 space-y-4">
              <div className="h-[calc(50vh-100px)] min-h-[250px]">
                <AIDecisionLog decisions={decisions} maxItems={30} />
              </div>
              <div className="h-[calc(50vh-100px)] min-h-[250px]">
                <SocialActivityFeed
                  events={socialEvents}
                  contentTitles={contentTitles}
                />
              </div>
            </div>

            {/* Right Column - Scores, Resources, Screen Distribution, Demo Controls */}
            <div className="md:col-span-2 xl:col-span-4 space-y-4">
              <ScoreDisplay scores={scores} contentTitles={contentTitles} />
              <ResourceChart history={resourceHistory} />
              <ScreenDistribution userActivities={userActivities} />
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

import { ContainerStatus } from './ContainerStatus';
import { AIDecisionLog } from './AIDecisionLog';
import { ScoreDisplay } from './ScoreDisplay';
import { ModeIndicator } from './ModeIndicator';
import { ResourceChart } from './ResourceChart';
import { DemoControls } from './DemoControls';
import type {
  ContentItem,
  ContainerStatus as ContainerStatusType,
  OperationalMode,
  AIDecision,
  InputScores,
  ResourceAllocation,
  DemoControlPayload,
} from '../../types';

interface DashboardProps {
  connected: boolean;
  sessionId: string | null;
  content: ContentItem[];
  containerStates: Record<string, ContainerStatusType>;
  currentMode: OperationalMode;
  activeContentId: string | null;
  decisions: AIDecision[];
  scores: Record<string, InputScores>;
  resourceHistory: ResourceAllocation[];
  onDemoControl: (payload: DemoControlPayload) => void;
  onResetDemo: () => void;
}

export function Dashboard({
  connected,
  sessionId,
  content,
  containerStates,
  currentMode,
  activeContentId,
  decisions,
  scores,
  resourceHistory,
  onDemoControl,
  onResetDemo,
}: DashboardProps) {
  const contentTitles = content.reduce(
    (acc, item) => ({ ...acc, [item.id]: item.title }),
    {} as Record<string, string>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              GAVIGO IRE Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              AI-Driven Container Orchestration Visualization
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {sessionId && (
              <span className="text-xs text-gray-600 font-mono">
                Session: {sessionId.slice(0, 8)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Mode and Controls */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <ModeIndicator
            currentMode={currentMode}
            activeContentId={activeContentId}
          />
          <DemoControls
            content={content}
            onDemoControl={onDemoControl}
            onResetDemo={onResetDemo}
          />
          <ContainerStatus content={content} containerStates={containerStates} />
        </div>

        {/* Center Column - Decision Log */}
        <div className="col-span-12 lg:col-span-5">
          <div className="h-[calc(100vh-160px)]">
            <AIDecisionLog decisions={decisions} maxItems={30} />
          </div>
        </div>

        {/* Right Column - Scores and Resources */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <ScoreDisplay scores={scores} contentTitles={contentTitles} />
          <ResourceChart history={resourceHistory} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

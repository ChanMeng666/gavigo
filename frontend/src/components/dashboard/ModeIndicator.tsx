import type { OperationalMode } from '../../types';

interface ModeIndicatorProps {
  currentMode: OperationalMode;
  activeContentId: string | null;
  since?: string;
}

const modeConfig: Record<
  OperationalMode,
  { label: string; description: string; color: string; icon: string }
> = {
  MIXED_STREAM_BROWSING: {
    label: 'Mixed Stream',
    description: 'User is browsing mixed content feed',
    color: 'from-purple-500 to-blue-500',
    icon: '📱',
  },
  GAME_FOCUS_MODE: {
    label: 'Game Focus',
    description: 'User is engaged in gaming content',
    color: 'from-red-500 to-orange-500',
    icon: '🎮',
  },
  AI_SERVICE_MODE: {
    label: 'AI Service',
    description: 'User is using AI services',
    color: 'from-green-500 to-teal-500',
    icon: '🤖',
  },
};

export function ModeIndicator({
  currentMode,
  activeContentId,
  since,
}: ModeIndicatorProps) {
  const config = modeConfig[currentMode];

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Current Mode</h3>
      <div
        className={`bg-gradient-to-r ${config.color} rounded-lg p-4 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h4 className="text-white font-bold text-xl">{config.label}</h4>
              <p className="text-white/80 text-sm">{config.description}</p>
            </div>
          </div>
          {activeContentId && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-white/70 text-sm">
                Active Content:{' '}
                <span className="text-white font-mono">
                  {activeContentId.slice(0, 12)}...
                </span>
              </p>
            </div>
          )}
          {since && (
            <p className="text-white/50 text-xs mt-2">
              Since: {new Date(since).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Object.entries(modeConfig).map(([mode, cfg]) => (
          <div
            key={mode}
            className={`p-2 rounded text-center text-xs ${
              mode === currentMode
                ? 'bg-white/10 ring-2 ring-white/30'
                : 'bg-gray-800 opacity-50'
            }`}
          >
            <span className="block text-lg mb-1">{cfg.icon}</span>
            <span className="text-gray-400">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

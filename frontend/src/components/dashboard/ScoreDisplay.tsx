import type { InputScores } from '../../types';

interface ScoreDisplayProps {
  scores: Record<string, InputScores>;
  contentTitles: Record<string, string>;
  thresholds?: {
    warmThreshold: number;
    hotThreshold: number;
  };
}

export function ScoreDisplay({
  scores,
  contentTitles,
  thresholds = { warmThreshold: 0.6, hotThreshold: 0.8 },
}: ScoreDisplayProps) {
  const scoreEntries = Object.entries(scores).sort(
    ([, a], [, b]) => b.combined_score - a.combined_score
  );

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Real-time Scores</h3>
      <div className="space-y-3">
        {scoreEntries.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No score data available</div>
        ) : (
          scoreEntries.map(([contentId, score]) => (
            <div key={contentId} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium truncate max-w-[150px]">
                  {contentTitles[contentId] || contentId.slice(0, 8)}
                </span>
                <span
                  className={`text-sm font-bold ${
                    score.combined_score >= thresholds.hotThreshold
                      ? 'text-red-400'
                      : score.combined_score >= thresholds.warmThreshold
                      ? 'text-yellow-400'
                      : 'text-gray-400'
                  }`}
                >
                  {(score.combined_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="space-y-1">
                <ScoreBar
                  label="Personal"
                  value={score.personal_score}
                  color="bg-blue-500"
                />
                <ScoreBar
                  label="Global"
                  value={score.global_score}
                  color="bg-green-500"
                />
                <ScoreBar
                  label="Combined"
                  value={score.combined_score}
                  color={
                    score.combined_score >= thresholds.hotThreshold
                      ? 'bg-red-500'
                      : score.combined_score >= thresholds.warmThreshold
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }
                  showThresholds
                  thresholds={thresholds}
                />
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <p>Thresholds:</p>
          <div className="flex gap-4 mt-1">
            <span>
              WARM: {(thresholds.warmThreshold * 100).toFixed(0)}%
            </span>
            <span>
              HOT: {(thresholds.hotThreshold * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  value: number;
  color: string;
  showThresholds?: boolean;
  thresholds?: { warmThreshold: number; hotThreshold: number };
}

function ScoreBar({
  label,
  value,
  color,
  showThresholds,
  thresholds,
}: ScoreBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-16">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full relative overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(value * 100, 100)}%` }}
        />
        {showThresholds && thresholds && (
          <>
            <div
              className="absolute top-0 h-full w-px bg-yellow-500/50"
              style={{ left: `${thresholds.warmThreshold * 100}%` }}
            />
            <div
              className="absolute top-0 h-full w-px bg-red-500/50"
              style={{ left: `${thresholds.hotThreshold * 100}%` }}
            />
          </>
        )}
      </div>
      <span className="text-xs text-gray-400 w-10 text-right">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

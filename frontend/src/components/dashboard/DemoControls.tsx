import { useState } from 'react';
import type { ContentItem, DemoControlPayload } from '../../types';

interface DemoControlsProps {
  content: ContentItem[];
  onDemoControl: (payload: DemoControlPayload) => void;
  onResetDemo: () => void;
}

export function DemoControls({ content, onDemoControl, onResetDemo }: DemoControlsProps) {
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [viralScore, setViralScore] = useState<number>(0.9);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTrendSpike = () => {
    if (!selectedContent) return;
    onDemoControl({
      action: 'trigger_trend_spike',
      target_content_id: selectedContent,
      value: viralScore,
    });
  };

  const handleForceWarm = () => {
    if (!selectedContent) return;
    onDemoControl({
      action: 'force_warm',
      target_content_id: selectedContent,
    });
  };

  const handleForceCold = () => {
    if (!selectedContent) return;
    onDemoControl({
      action: 'force_cold',
      target_content_id: selectedContent,
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-white">Demo Controls</h3>
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Target Content
            </label>
            <select
              value={selectedContent}
              onChange={(e) => setSelectedContent(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg p-2 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select content...</option>
              {content.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleForceWarm}
              disabled={!selectedContent}
              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg p-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Force WARM
            </button>
            <button
              onClick={handleForceCold}
              disabled={!selectedContent}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg p-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Force COLD
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Viral Score: {(viralScore * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={viralScore}
              onChange={(e) => setViralScore(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleTrendSpike}
            disabled={!selectedContent}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg p-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Trigger Trend Spike
          </button>

          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={onResetDemo}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg p-2 text-sm font-medium transition-colors"
            >
              Reset Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

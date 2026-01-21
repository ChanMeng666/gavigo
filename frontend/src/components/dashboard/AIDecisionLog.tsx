import { useEffect, useRef } from 'react';
import type { AIDecision } from '../../types';

interface AIDecisionLogProps {
  decisions: AIDecision[];
  maxItems?: number;
}

const triggerColors: Record<string, string> = {
  CROSS_DOMAIN: 'text-purple-400',
  SWARM_BOOST: 'text-green-400',
  PROACTIVE_WARM: 'text-yellow-400',
  MODE_CHANGE: 'text-blue-400',
  RESOURCE_THROTTLE: 'text-red-400',
};

const actionIcons: Record<string, string> = {
  INJECT_CONTENT: '💉',
  SCALE_WARM: '🔥',
  SCALE_HOT: '🌋',
  THROTTLE_BACKGROUND: '⏸️',
  CHANGE_MODE: '🔄',
};

export function AIDecisionLog({ decisions, maxItems = 20 }: AIDecisionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [decisions]);

  const displayDecisions = decisions.slice(0, maxItems);

  return (
    <div className="bg-gray-900 rounded-lg p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">AI Decision Log</h3>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-700"
      >
        {displayDecisions.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No decisions yet. Interact with the stream to generate AI decisions.
          </div>
        ) : (
          displayDecisions.map((decision) => (
            <div
              key={decision.decision_id}
              className={`bg-gray-800 rounded-lg p-3 border-l-4 ${
                decision.success ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {actionIcons[decision.resulting_action] || '🤖'}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      triggerColors[decision.trigger_type] || 'text-gray-400'
                    }`}
                  >
                    {decision.trigger_type}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(decision.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{decision.reasoning_text}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Content: {decision.affected_content_id.slice(0, 8)}...
                </span>
                <div className="flex gap-2">
                  <span className="text-blue-400">
                    P: {decision.input_scores.personal_score.toFixed(2)}
                  </span>
                  <span className="text-green-400">
                    G: {decision.input_scores.global_score.toFixed(2)}
                  </span>
                  <span className="text-yellow-400">
                    C: {decision.input_scores.combined_score.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

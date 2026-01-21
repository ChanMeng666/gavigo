import { forwardRef } from 'react';
import type { ContentItem, ContainerStatus } from '../../types';

interface ContentCardProps {
  content: ContentItem;
  containerStatus: ContainerStatus;
  isActive: boolean;
  onActivate: (contentId: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const typeIcons: Record<string, string> = {
  GAME: '🎮',
  AI_SERVICE: '🤖',
  VIDEO: '🎬',
};

const typeColors: Record<string, string> = {
  GAME: 'from-red-500 to-orange-500',
  AI_SERVICE: 'from-green-500 to-teal-500',
  VIDEO: 'from-blue-500 to-purple-500',
};

const statusIndicators: Record<ContainerStatus, { color: string; pulse: boolean }> = {
  COLD: { color: 'bg-blue-500', pulse: false },
  WARM: { color: 'bg-yellow-500', pulse: true },
  HOT: { color: 'bg-red-500', pulse: true },
};

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(
  ({ content, containerStatus, isActive, onActivate, onMouseEnter, onMouseLeave }, ref) => {
    const status = statusIndicators[containerStatus];

    return (
      <div
        ref={ref}
        data-content-id={content.id}
        data-theme={content.theme}
        className={`relative bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 ${
          isActive ? 'ring-2 ring-white shadow-lg scale-[1.02]' : 'hover:scale-[1.01]'
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-900">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${typeColors[content.type]} opacity-30`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">{typeIcons[content.type]}</span>
          </div>

          {/* Status indicator */}
          <div className="absolute top-3 right-3">
            <div
              className={`w-3 h-3 rounded-full ${status.color} ${
                status.pulse ? 'animate-pulse' : ''
              }`}
            />
          </div>

          {/* Score indicator */}
          <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-2 py-1">
            <span className="text-xs text-white font-mono">
              Score: {(content.combined_score * 100).toFixed(0)}%
            </span>
          </div>

          {/* Content type badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${typeColors[content.type]} text-white`}
            >
              {content.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Content info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{content.title}</h3>
              <p className="text-gray-400 text-sm truncate">{content.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                  #{content.theme}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    containerStatus === 'HOT'
                      ? 'bg-red-500/20 text-red-400'
                      : containerStatus === 'WARM'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {containerStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Activate button */}
          <button
            onClick={() => onActivate(content.id)}
            disabled={containerStatus === 'COLD'}
            className={`mt-4 w-full py-2 rounded-lg font-medium transition-all ${
              containerStatus === 'COLD'
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : containerStatus === 'HOT'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
          >
            {containerStatus === 'COLD'
              ? 'Not Ready'
              : containerStatus === 'HOT'
              ? 'Active'
              : 'Activate'}
          </button>
        </div>
      </div>
    );
  }
);

ContentCard.displayName = 'ContentCard';

import { useEffect, useState } from 'react';
import type { ContentItem, ContainerStatus } from '../../types';

interface FullScreenViewProps {
  content: ContentItem;
  containerStatus: ContainerStatus;
  onDeactivate: () => void;
}

const typeBackgrounds: Record<string, string> = {
  GAME: 'from-red-900 via-orange-900 to-yellow-900',
  AI_SERVICE: 'from-green-900 via-teal-900 to-cyan-900',
  VIDEO: 'from-blue-900 via-purple-900 to-pink-900',
};

const typeIcons: Record<string, string> = {
  GAME: '🎮',
  AI_SERVICE: '🤖',
  VIDEO: '🎬',
};

export function FullScreenView({
  content,
  containerStatus,
  onDeactivate,
}: FullScreenViewProps) {
  // Seamless activation: content displays immediately without loading indicators
  // The orchestrator should have already pre-warmed the container (WARM/HOT state)
  // This implements the "Instant Reality" experience - no loading bars per spec FR-005

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br ${typeBackgrounds[content.type]} flex flex-col`}
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{typeIcons[content.type]}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{content.title}</h1>
            <p className="text-white/70 text-sm">{content.description}</p>
          </div>
        </div>
        <button
          onClick={onDeactivate}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Exit
        </button>
      </header>

      {/* Main content area - displays immediately for seamless "Instant Reality" experience */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <div className="bg-black/30 rounded-2xl p-8 backdrop-blur-sm">
            {content.type === 'GAME' && (
              <GameSimulation title={content.title} theme={content.theme} />
            )}
            {content.type === 'AI_SERVICE' && (
              <AIServiceSimulation title={content.title} />
            )}
            {content.type === 'VIDEO' && (
              <VideoSimulation title={content.title} theme={content.theme} />
            )}
          </div>
        </div>
      </div>

      {/* Footer with container info */}
      <footer className="p-4 bg-black/30">
        <div className="flex items-center justify-between text-sm text-white/70">
          <div className="flex items-center gap-4">
            <span>Deployment: {content.deployment_name}</span>
            <span>Theme: #{content.theme}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                containerStatus === 'HOT' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
              }`}
            />
            <span>Container: {containerStatus}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Simulated game interface
function GameSimulation({ title, theme }: { title: string; theme: string }) {
  return (
    <div className="text-center">
      <div className="text-8xl mb-6">🎮</div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-white/70 mb-8">
        Interactive {theme} gaming experience is now active
      </p>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        <button className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white">
          W
        </button>
        <button className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white col-span-2">
          ⬆️
        </button>
        <button className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white">
          E
        </button>
        <button className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white">
          A
        </button>
        <button className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white">
          ⬅️
        </button>
        <button className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white">
          ➡️
        </button>
        <button className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white">
          D
        </button>
      </div>
      <p className="text-white/50 text-sm mt-6">
        [Simulated game controls - actual game would load here]
      </p>
    </div>
  );
}

// Simulated AI service interface
function AIServiceSimulation({ title }: { title: string }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      `You: ${input}`,
      `AI: I'm a simulated AI response for "${input}"`,
    ]);
    setInput('');
  };

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-6xl">🤖</span>
        <h2 className="text-2xl font-bold text-white mt-4">{title}</h2>
      </div>
      <div className="bg-black/30 rounded-lg p-4 h-48 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-white/50 text-center">Start a conversation...</p>
        ) : (
          messages.map((msg, i) => (
            <p
              key={i}
              className={`mb-2 ${
                msg.startsWith('You:') ? 'text-blue-300' : 'text-green-300'
              }`}
            >
              {msg}
            </p>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Simulated video player
function VideoSimulation({ title, theme }: { title: string; theme: string }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="text-center">
      <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl">🎬</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/70 mb-4">Now streaming {theme} content</p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setProgress(Math.max(0, progress - 10))}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
        >
          ⏪
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-4 bg-white/20 hover:bg-white/30 rounded-full text-white text-xl"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          onClick={() => setProgress(Math.min(100, progress + 10))}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
        >
          ⏩
        </button>
      </div>
    </div>
  );
}

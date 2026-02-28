import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusIndicator } from "@/components/ui/status-indicator"
import {
  contentTypeIcons,
  contentTypeConfig,
  CloseIcon,

} from "@/components/icons"
import { cn } from "@/lib/utils"
import type { ContentItem, ContainerStatus } from "@/types"

interface FullScreenViewProps {
  content: ContentItem
  containerStatus: ContainerStatus
  onDeactivate: () => void
}

const typeBackgrounds: Record<string, string> = {
  GAME: "from-hot/30 via-warm/20 to-base",
  AI_SERVICE: "from-accent-success/30 via-accent-secondary/20 to-base",
  VIDEO: "from-cold/30 via-accent-secondary/20 to-base",
}

export function FullScreenView({
  content,
  containerStatus,
  onDeactivate,
}: FullScreenViewProps) {
  const TypeIcon = contentTypeIcons[content.type]
  const typeConfig = contentTypeConfig[content.type]

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDeactivate()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onDeactivate])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed inset-0 z-50 bg-gradient-to-br flex flex-col",
        typeBackgrounds[content.type]
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
            typeConfig.gradient
          )}>
            <TypeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">
              {content.title}
            </h1>
            <p className="text-white/70 text-sm">{content.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onDeactivate}
          className="text-white hover:bg-white/20 gap-2"
        >
          <CloseIcon className="h-4 w-4" />
          Exit <kbd className="ml-2 text-xs opacity-60">ESC</kbd>
        </Button>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-black/30 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
            {content.type === "GAME" && (
              <GamePlayer deploymentName={content.deployment_name} title={content.title} />
            )}
            {content.type === "AI_SERVICE" && (
              <AIServiceChat title={content.title} />
            )}
            {/* Videos removed - only games and AI service are orchestrated */}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="p-4 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm text-white/70">
          <div className="flex items-center gap-4">
            <span className="font-mono">{content.deployment_name}</span>
            <Badge variant="secondary" className="text-xs">
              #{content.theme}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status={containerStatus} size="sm" />
            <span>Container: {containerStatus}</span>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

// Game deployment to URL mapping
const gameUrlMap: Record<string, string> = {
  "game-2048": "https://games.crazygames.com/en_US/2048/index.html",
  "game-slice-master": "https://games.crazygames.com/en_US/slice-master/index.html",
  "game-space-waves": "https://games.crazygames.com/en_US/space-waves/index.html",
  "game-drift-boss": "https://games.crazygames.com/en_US/drift-boss/index.html",
  "game-tiny-fishing": "https://games.crazygames.com/en_US/tiny-fishing/index.html",
  "game-stickman-hook": "https://games.crazygames.com/en_US/stickman-hook/index.html",
  "game-moto-x3m": "https://games.crazygames.com/en_US/moto-x3m/index.html",
  "game-paper-io-2": "https://games.crazygames.com/en_US/paper-io-2/index.html",
  "game-temple-of-boom": "https://games.crazygames.com/en_US/temple-of-boom/index.html",
  "game-monkey-mart": "https://games.crazygames.com/en_US/monkey-mart/index.html",
  "game-tunnel-rush": "https://games.crazygames.com/en_US/tunnel-rush/index.html",
  "game-narrow-one": "https://games.crazygames.com/en_US/narrow-one/index.html",
  "game-smash-karts": "https://games.crazygames.com/en_US/smash-karts/index.html",
  // FPS Arena
  "game-shell-shockers": "https://games.crazygames.com/en_US/shellshockersio/index.html",
  "game-kour-io": "https://games.crazygames.com/en_US/kour-io/index.html",
  "game-voxiom-io": "https://games.crazygames.com/en_US/voxiom-io/index.html",
  "game-bullet-force": "https://games.crazygames.com/en_US/bullet-force-multiplayer/index.html",
  "game-skillwarz": "https://games.crazygames.com/en_US/skillwarz/index.html",
  "game-buildnow-gg": "https://games.crazygames.com/en_US/buildnow-gg/index.html",
  "game-1v1-lol": "https://games.crazygames.com/en_US/1v1lol/index.html",
  "game-pixel-warfare": "https://games.crazygames.com/en_US/pixel-warfare/index.html",
  // Arcade Zone
  "game-geometry-dash": "https://games.crazygames.com/en_US/geometry-dash-online/index.html",
  "game-color-tunnel": "https://games.crazygames.com/en_US/color-tunnel/index.html",
  "game-helix-jump": "https://games.crazygames.com/en_US/helix-jump/index.html",
  "game-stacky-bird": "https://games.crazygames.com/en_US/stacky-bird/index.html",
  "game-jet-rush": "https://games.crazygames.com/en_US/jet-rush/index.html",
  "game-count-masters": "https://games.crazygames.com/en_US/count-masters-stickman-games/index.html",
  "game-man-runner-2048": "https://games.crazygames.com/en_US/man-runner-2048/index.html",
  // IO World
  "game-agar-io": "https://games.crazygames.com/en_US/agario/index.html",
  "game-evowars-io": "https://games.crazygames.com/en_US/evowarsio/index.html",
  "game-bloxd-io": "https://games.crazygames.com/en_US/bloxdhop-io/index.html",
  "game-cubes-2048": "https://games.crazygames.com/en_US/cubes-2048-io/index.html",
  "game-diep-io": "https://games.crazygames.com/en_US/diepio/index.html",
  "game-zombs-royale": "https://games.crazygames.com/en_US/zombsroyaleio/index.html",
  "game-snake-io": "https://games.crazygames.com/en_US/snake-io/index.html",
  "game-skribbl-io": "https://games.crazygames.com/en_US/skribblio/index.html",
  "game-lol-beans": "https://games.crazygames.com/en_US/lolbeans-io/index.html",
  "game-fly-or-die": "https://games.crazygames.com/en_US/flyordieio/index.html",
  // Sports Hub
  "game-basketbros": "https://games.crazygames.com/en_US/basketbros/index.html",
  "game-basketball-stars": "https://games.crazygames.com/en_US/basketball-stars-2019/index.html",
  "game-goal-gang": "https://games.crazygames.com/en_US/goal-gang/index.html",
  "game-basket-random": "https://games.crazygames.com/en_US/basket-random/index.html",
  "game-8-ball-pool": "https://games.crazygames.com/en_US/8-ball-billiards-classic/index.html",
  "game-mini-golf": "https://games.crazygames.com/en_US/mini-golf-club/index.html",
  "game-crazy-flips": "https://games.crazygames.com/en_US/crazy-flips-3d/index.html",
  // Puzzle Lab
  "game-uno-online": "https://games.crazygames.com/en_US/uno-online/index.html",
  "game-chess": "https://games.crazygames.com/en_US/chess-free/index.html",
  "game-checkers": "https://games.crazygames.com/en_US/checkers-free/index.html",
  "game-backgammon": "https://games.crazygames.com/en_US/classic-backgammon/index.html",
  "game-mahjong": "https://games.crazygames.com/en_US/mahjongg-solitaire/index.html",
  "game-master-chess": "https://games.crazygames.com/en_US/master-chess/index.html",
  "game-mancala": "https://games.crazygames.com/en_US/mancala-classic/index.html",
  // Idle Kingdom
  "game-clicker-heroes": "https://games.crazygames.com/en_US/clicker-heroes/index.html",
  "game-mr-mine": "https://games.crazygames.com/en_US/mister-mine/index.html",
  "game-doge-miner": "https://games.crazygames.com/en_US/doge-miner/index.html",
  "game-doge-miner-2": "https://games.crazygames.com/en_US/doge-miner-2/index.html",
  "game-planet-clicker": "https://games.crazygames.com/en_US/planet-clicker/index.html",
  "game-race-clicker": "https://games.crazygames.com/en_US/race-clicker-tap-tap-game/index.html",
  "game-idle-inventor": "https://games.crazygames.com/en_US/idle-inventor/index.html",
  // Casual Play
  "game-crazy-fish": "https://games.crazygames.com/en_US/crazy-fish/index.html",
  "game-papas-pizzeria": "https://games.crazygames.com/en_US/papas-pizzeria/index.html",
  "game-getting-over-it": "https://games.crazygames.com/en_US/getting-over-it/index.html",
  "game-friday-night-funkin": "https://games.crazygames.com/en_US/friday-night-funkin/index.html",
  "game-bubble-blast": "https://games.crazygames.com/en_US/bubble-blast-pwd/index.html",
  "game-fireboy-watergirl": "https://games.crazygames.com/en_US/fireboy-and-watergirl-6-fairy-tales/index.html",
  // Racing & Karts
  "game-night-city-racing": "https://games.crazygames.com/en_US/night-city-racing/index.html",
  "game-mx-offroad": "https://games.crazygames.com/en_US/mx-offroad-master/index.html",
  // Battle Arena
  "game-rooftop-snipers": "https://games.crazygames.com/en_US/rooftop-snipers/index.html",
  "game-getaway-shootout": "https://games.crazygames.com/en_US/getaway-shootout/index.html",
  "game-ragdoll-archers": "https://games.crazygames.com/en_US/ragdoll-archers/index.html",
  "game-stickman-clash": "https://games.crazygames.com/en_US/stickman-clash/index.html",
  "game-tank-stars": "https://games.crazygames.com/en_US/tank-stars-online/index.html",
  "game-castle-craft": "https://games.crazygames.com/en_US/castle-craft/index.html",
  "game-iron-legion": "https://games.crazygames.com/en_US/iron-legion/index.html",
  "game-hex-empire": "https://games.crazygames.com/en_US/hex-empire/index.html",
  "game-rocket-bot-royale": "https://games.crazygames.com/en_US/rocket-bot-royale/index.html",
  "game-horde-killer": "https://games.crazygames.com/en_US/horde-killer-you-vs-100/index.html",
  "game-superhot": "https://games.crazygames.com/en_US/super-hot/index.html",
  "game-time-shooter-2": "https://games.crazygames.com/en_US/time-shooter-2/index.html",
  "game-street-fighter-2": "https://games.crazygames.com/en_US/street-fighter-2/index.html",
}

// Real game player component with iframe embedding
function GamePlayer({ deploymentName, title }: { deploymentName: string; title: string }) {
  const gameUrl = gameUrlMap[deploymentName] || "#"
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="text-center">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-hot to-warm flex items-center justify-center animate-pulse">
              <contentTypeIcons.GAME className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
        <iframe
          src={gameUrl}
          title={title}
          className="w-full h-full border-0"
          allow="autoplay; payment; fullscreen; microphone; clipboard-read; focus-without-user-activation; screen-wake-lock; gamepad; clipboard-write"
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <h2 className="text-2xl font-display font-bold text-white mb-2">{title}</h2>
      <p className="text-white/50 text-xs mt-2">
        Click to play
      </p>
    </div>
  )
}

// Chat message type
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Real AI service chat interface with OpenAI backend
function AIServiceChat({ title }: { title: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/workloads/ai-service/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Sorry, I could not process your request.'
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not connect to the AI service. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-success to-accent-secondary flex items-center justify-center mb-4">
          <contentTypeIcons.AI_SERVICE className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
      </div>
      <div className="bg-black/30 rounded-lg p-4 h-48 overflow-y-auto mb-4 scrollbar-thin">
        {messages.length === 0 ? (
          <p className="text-white/50 text-center text-sm">Start a conversation with the AI...</p>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "mb-3 text-sm",
                  msg.role === 'user' ? "text-right" : "text-left"
                )}
              >
                <span className={cn(
                  "inline-block px-3 py-2 rounded-lg max-w-[80%]",
                  msg.role === 'user'
                    ? "bg-accent-primary/30 text-white"
                    : "bg-accent-success/30 text-white"
                )}>
                  {msg.content}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-3">
                <span className="inline-block px-3 py-2 rounded-lg bg-accent-success/30 text-white/70">
                  Thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1 bg-white/10 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 placeholder:text-white/30 disabled:opacity-50"
        />
        <Button
          type="submit"
          variant="secondary"
          className="bg-white/20 hover:bg-white/30"
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Send'}
        </Button>
      </form>
    </div>
  )
}



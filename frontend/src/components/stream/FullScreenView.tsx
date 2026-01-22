import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusIndicator } from "@/components/ui/status-indicator"
import {
  contentTypeIcons,
  contentTypeConfig,
  CloseIcon,
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  SkipBackIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
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
              <GameSimulation title={content.title} theme={content.theme} />
            )}
            {content.type === "AI_SERVICE" && (
              <AIServiceSimulation title={content.title} />
            )}
            {content.type === "VIDEO" && (
              <VideoSimulation title={content.title} theme={content.theme} />
            )}
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

// Simulated game interface
function GameSimulation({ title, theme }: { title: string; theme: string }) {
  return (
    <div className="text-center">
      <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-hot to-warm flex items-center justify-center mb-6">
        <contentTypeIcons.GAME className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-2xl font-display font-bold text-white mb-4">{title}</h2>
      <p className="text-white/70 mb-8">
        Interactive {theme} gaming experience is now active
      </p>
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        <div />
        <Button variant="ghost" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
          <ArrowUpIcon className="h-5 w-5" />
        </Button>
        <div />
        <Button variant="ghost" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
          <ArrowDownIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
          <ArrowRightIcon className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-white/50 text-xs mt-6">
        Simulated game controls - actual game would load here
      </p>
    </div>
  )
}

// Simulated AI service interface
function AIServiceSimulation({ title }: { title: string }) {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((prev) => [
      ...prev,
      `You: ${input}`,
      `AI: I'm a simulated AI response for "${input}"`,
    ])
    setInput("")
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
          <p className="text-white/50 text-center text-sm">Start a conversation...</p>
        ) : (
          messages.map((msg, i) => (
            <p
              key={i}
              className={cn(
                "mb-2 text-sm",
                msg.startsWith("You:") ? "text-accent-primary" : "text-accent-success"
              )}
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
          className="flex-1 bg-white/10 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 placeholder:text-white/30"
        />
        <Button type="submit" variant="secondary" className="bg-white/20 hover:bg-white/30">
          Send
        </Button>
      </form>
    </div>
  )
}

// Simulated video player
function VideoSimulation({ title, theme }: { title: string; theme: string }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5))
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="text-center">
      <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cold to-accent-primary flex items-center justify-center">
            <contentTypeIcons.VIDEO className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-display font-bold text-white mb-2">{title}</h2>
      <p className="text-white/70 mb-4 text-sm">Now streaming {theme} content</p>
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setProgress(Math.max(0, progress - 10))}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <SkipBackIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-white/20 hover:bg-white/30 text-white h-14 w-14 rounded-full"
        >
          {isPlaying ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setProgress(Math.min(100, progress + 10))}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <SkipForwardIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}


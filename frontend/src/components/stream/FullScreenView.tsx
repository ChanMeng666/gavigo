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

import { gameUrlMap } from "@/data/games"

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



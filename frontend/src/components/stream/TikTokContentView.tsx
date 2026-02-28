import { useRef, useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StatusIndicator } from "@/components/ui/status-indicator"
import {
  contentTypeIcons,
  contentTypeConfig,
  HeartIcon,
  ShareIcon,
  CommentIcon,
  Loader2,
  statusConfig,
} from "@/components/icons"
import { cn } from "@/lib/utils"
import type { ContentItem, ContainerStatus } from "@/types"

interface TikTokContentViewProps {
  content: ContentItem[]
  containerStates: Record<string, ContainerStatus>
  onActivate: (contentId: string) => void
  onContentChange?: (contentId: string, theme: string) => void
}

// ============================================
// LOADING STATE COMPONENT (COLD/WARM)
// ============================================
function ContentLoadingState({
  item,
  status,
}: {
  item: ContentItem
  status: ContainerStatus
}) {
  const TypeIcon = contentTypeIcons[item.type]
  const typeConfig = contentTypeConfig[item.type]

  const statusMessages = {
    COLD: "Spinning up container...",
    WARM: "Almost ready...",
    HOT: "Loading content...",
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Animated background pulse */}
      <motion.div
        className={cn(
          "absolute inset-0 opacity-20 bg-gradient-to-br",
          typeConfig.gradient
        )}
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Content type icon with pulse */}
      <motion.div
        className={cn(
          "relative h-24 w-24 rounded-3xl flex items-center justify-center bg-gradient-to-br shadow-2xl",
          typeConfig.gradient
        )}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <TypeIcon className="h-12 w-12 text-white" />

        {/* Spinning ring for COLD state */}
        {status === "COLD" && (
          <motion.div
            className="absolute inset-[-8px] rounded-[2rem] border-4 border-transparent border-t-white/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>

      {/* Status message */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
        <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{statusMessages[status]}</span>
        </div>
      </motion.div>

      {/* Status indicator */}
      <div className="absolute bottom-20 flex items-center gap-2">
        <StatusIndicator status={status} size="sm" />
        <span className={cn("text-xs font-medium", statusConfig[status].className)}>
          {statusConfig[status].label}
        </span>
      </div>
    </div>
  )
}

// ============================================
// INLINE GAME IFRAME
// ============================================
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
}

function InlineGamePlayer({
  deploymentName,
  isVisible,
}: {
  deploymentName: string
  isVisible: boolean
}) {
  const gameUrl = gameUrlMap[deploymentName] || "#"
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="absolute inset-0 bg-black">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
      <iframe
        src={isVisible ? gameUrl : "about:blank"}
        title="Game"
        className={cn(
          "w-full h-full border-0 transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        allow="autoplay; payment; fullscreen; microphone; clipboard-read; focus-without-user-activation; screen-wake-lock; gamepad; clipboard-write"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Game controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-[10px]">
          Click to play
        </div>
      </div>
    </div>
  )
}

// ============================================
// INLINE AI CHAT
// ============================================
interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

function InlineAIChat({ isVisible: _isVisible }: { isVisible: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/workloads/ai-service/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || "Sorry, I could not process your request.",
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not connect to the AI service.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-emerald-900/50 via-gray-900 to-black">
      {/* Chat header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
            <contentTypeIcons.AI_SERVICE className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
            <span className="text-emerald-400 text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <contentTypeIcons.AI_SERVICE className="h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/40 text-sm">
              Start a conversation with AI
            </p>
            <p className="text-white/30 text-xs mt-1">
              Powered by OpenAI
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-2xl text-sm",
                  msg.role === "user"
                    ? "bg-emerald-500 text-white rounded-br-md"
                    : "bg-white/10 text-white rounded-bl-md"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 p-3 border-t border-white/10 bg-black/50"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 bg-white/10 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-white/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
          >
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

// ============================================
// CONTENT OVERLAY UI (TikTok style)
// ============================================
function ContentOverlay({
  item,
  containerStatus,
}: {
  item: ContentItem
  containerStatus: ContainerStatus
}) {
  const [liked, setLiked] = useState(false)
  const typeConfig = contentTypeConfig[item.type]

  // Generate pseudo-random engagement numbers
  const hashCode = item.id.split("").reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  const likes = Math.abs(hashCode % 10000) + 100
  const comments = Math.abs((hashCode >> 8) % 500) + 10

  return (
    <>
      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-14 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        {/* Creator info */}
        <div className="flex items-center gap-2 mb-2 pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center ring-2 ring-white">
            <span className="text-xs font-bold text-white">
              {item.theme[0].toUpperCase()}
            </span>
          </div>
          <span className="text-white font-semibold text-sm">
            @gavigo_{item.theme}
          </span>
          <button className="px-3 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors">
            Follow
          </button>
        </div>

        {/* Title and description */}
        <h3 className="text-white font-bold text-base leading-tight mb-1">
          {item.title}
        </h3>
        <p className="text-white/70 text-sm line-clamp-2 mb-2">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-white/80 text-xs">#{item.theme}</span>
          <span className="text-white/80 text-xs">#{typeConfig.label.toLowerCase()}</span>
          <span className="text-white/80 text-xs">#gavigo</span>
          <span className="text-white/80 text-xs">#ire</span>
        </div>
      </div>

      {/* Right-side action buttons */}
      <div className="absolute right-2 bottom-32 flex flex-col items-center gap-5 pointer-events-auto">
        {/* Like button */}
        <button
          onClick={() => setLiked(!liked)}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-all",
              liked ? "bg-red-500" : "bg-white/10 backdrop-blur-sm"
            )}
          >
            <HeartIcon
              className={cn(
                "h-6 w-6 transition-all",
                liked ? "fill-white text-white scale-110" : "text-white"
              )}
            />
          </div>
          <span className="text-white text-xs font-medium">
            {liked ? likes + 1 : likes}
          </span>
        </button>

        {/* Comment button */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <CommentIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{comments}</span>
        </button>

        {/* Share button */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <ShareIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>

        {/* Content type indicator */}
        <div className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br animate-pulse",
          typeConfig.gradient
        )}>
          {contentTypeIcons[item.type] && (
            <contentTypeIcons.VIDEO className="h-5 w-5 text-white" />
          )}
        </div>
      </div>

      {/* Container status badge */}
      <div className="absolute top-4 right-3 pointer-events-none">
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-sm",
          containerStatus === "HOT" ? "bg-green-500/20" :
          containerStatus === "WARM" ? "bg-yellow-500/20" : "bg-blue-500/20"
        )}>
          <StatusIndicator status={containerStatus} size="sm" />
          <span className={cn(
            "text-[10px] font-medium",
            statusConfig[containerStatus].className
          )}>
            {containerStatus}
          </span>
        </div>
      </div>
    </>
  )
}

// ============================================
// SINGLE CONTENT SLIDE
// ============================================
function ContentSlide({
  item,
  containerStatus,
  onActivate,
  isVisible,
}: {
  item: ContentItem
  containerStatus: ContainerStatus
  onActivate: (contentId: string) => void
  isVisible: boolean
}) {
  // Auto-activate when content becomes visible
  useEffect(() => {
    if (isVisible) {
      // Always send activation request - orchestrator will handle state
      onActivate(item.id)
    }
  }, [isVisible, item.id, onActivate])

  const isReady = containerStatus === "HOT"
  const isLoading = containerStatus === "COLD" || containerStatus === "WARM"

  return (
    <div
      data-content-id={item.id}
      data-theme={item.theme}
      className="relative h-full w-full overflow-hidden"
    >
      {/* Content area */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <ContentLoadingState item={item} status={containerStatus} />
          </motion.div>
        )}

        {isReady && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {item.type === "GAME" && (
              <InlineGamePlayer
                deploymentName={item.deployment_name}
                isVisible={isVisible}
              />
            )}
            {item.type === "AI_SERVICE" && (
              <InlineAIChat isVisible={isVisible} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay UI - always visible */}
      <ContentOverlay item={item} containerStatus={containerStatus} />
    </div>
  )
}

// ============================================
// MAIN TIKTOK CONTENT VIEW
// ============================================
export function TikTokContentView({
  content,
  containerStates,
  onActivate,
  onContentChange,
}: TikTokContentViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Handle scroll to detect current content
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const itemHeight = container.clientHeight
      const newIndex = Math.round(scrollTop / itemHeight)

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < content.length) {
        setCurrentIndex(newIndex)
        const item = content[newIndex]
        onContentChange?.(item.id, item.theme)
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [content, currentIndex, onContentChange])

  // Trigger initial content change
  useEffect(() => {
    if (content.length > 0) {
      const item = content[0]
      onContentChange?.(item.id, item.theme)
    }
  }, [content, onContentChange])

  // Memoize onActivate to prevent unnecessary re-renders
  const handleActivate = useCallback(
    (contentId: string) => {
      onActivate(contentId)
    },
    [onActivate]
  )

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
      }}
    >
      {content.map((item, index) => (
        <div
          key={item.id}
          className="h-full w-full snap-start snap-always"
          style={{ scrollSnapAlign: "start" }}
        >
          <ContentSlide
            item={item}
            containerStatus={containerStates[item.id] || item.container_status}
            onActivate={handleActivate}
            isVisible={index === currentIndex}
          />
        </div>
      ))}

      {/* Pagination dots */}
      <div className="fixed right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30 pointer-events-none">
        {content.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1 rounded-full transition-all",
              index === currentIndex ? "h-4 bg-white" : "h-1.5 bg-white/30"
            )}
          />
        ))}
      </div>

      {/* Swipe hint (shows initially) */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="flex flex-col items-center text-white/50">
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </motion.div>
            <span className="text-xs">Swipe up</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

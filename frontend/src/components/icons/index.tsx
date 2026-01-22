import {
  Flame,
  Thermometer,
  Snowflake,
  Gamepad2,
  Bot,
  Video,
  Layers,
  Brain,
  Syringe,
  Zap,
  Pause,
  RefreshCw,
  Activity,
  LayoutDashboard,
  MonitorPlay,
  Columns,
  Maximize2,
  Minimize2,
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  Settings,
  MoreHorizontal,
  Menu,
  Wifi,
  WifiOff,
  Server,
  Container,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Play,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"

import type { ContainerStatus, ContentType, OperationalMode, ActionType, TriggerType } from "@/types"

// Re-export with semantic names
// Status Icons
export {
  Flame as HotIcon,
  Thermometer as WarmIcon,
  Snowflake as ColdIcon,
}

// Content Type Icons
export {
  Gamepad2 as GameIcon,
  Bot as AIServiceIcon,
  Video as VideoIcon,
  Layers as MixedContentIcon,
  Brain as AIBrainIcon,
}

// Action Icons
export {
  Syringe as InjectIcon,
  Zap as ScaleHotIcon,
  Pause as ThrottleIcon,
  RefreshCw as ChangeModeIcon,
  Activity as ActivityIcon,
}

// Navigation & UI Icons
export {
  LayoutDashboard as DashboardIcon,
  MonitorPlay as StreamIcon,
  Columns as SplitViewIcon,
  Maximize2 as FullscreenIcon,
  Minimize2 as ExitFullscreenIcon,
  X as CloseIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  MoreHorizontal as MoreIcon,
  Menu as MenuIcon,
}

// Status & State Icons
export {
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
  Server as ServerIcon,
  Container as ContainerIcon,
  Activity as PulseIcon,
  BarChart3 as ChartIcon,
  Clock as ClockIcon,
  CheckCircle2 as SuccessIcon,
  XCircle as ErrorIcon,
  AlertCircle as WarningIcon,
  Info as InfoIcon,
}

// Control Icons
export {
  Play as PlayIcon,
  Pause as PauseIcon,
  SkipForward as SkipForwardIcon,
  SkipBack as SkipBackIcon,
  RotateCcw as ResetIcon,
  Sparkles as SparklesIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
}

// Status icon mapping
export const statusIcons: Record<ContainerStatus, LucideIcon> = {
  HOT: Flame,
  WARM: Thermometer,
  COLD: Snowflake,
}

// Content type icon mapping
export const contentTypeIcons: Record<ContentType, LucideIcon> = {
  GAME: Gamepad2,
  AI_SERVICE: Bot,
  VIDEO: Video,
}

// Operational mode icon mapping
export const modeIcons: Record<OperationalMode, LucideIcon> = {
  MIXED_STREAM_BROWSING: Layers,
  GAME_FOCUS_MODE: Gamepad2,
  AI_SERVICE_MODE: Brain,
}

// Action type icon mapping
export const actionIcons: Record<ActionType, LucideIcon> = {
  INJECT_CONTENT: Syringe,
  SCALE_WARM: Thermometer,
  SCALE_HOT: Zap,
  THROTTLE_BACKGROUND: Pause,
  CHANGE_MODE: RefreshCw,
}

// Trigger type config with colors
export const triggerTypeConfig: Record<TriggerType, { label: string; className: string }> = {
  CROSS_DOMAIN: { label: "Cross Domain", className: "text-accent-primary bg-accent-primary/10" },
  SWARM_BOOST: { label: "Swarm Boost", className: "text-accent-success bg-accent-success/10" },
  PROACTIVE_WARM: { label: "Proactive Warm", className: "text-warm bg-warm/10" },
  MODE_CHANGE: { label: "Mode Change", className: "text-accent-secondary bg-accent-secondary/10" },
  RESOURCE_THROTTLE: { label: "Resource Throttle", className: "text-hot bg-hot/10" },
}

// Status config with labels and colors
export const statusConfig: Record<ContainerStatus, { label: string; description: string; className: string }> = {
  HOT: {
    label: "Hot",
    description: "Active - 2+ replicas",
    className: "text-hot",
  },
  WARM: {
    label: "Warm",
    description: "Standby - 1 replica",
    className: "text-warm",
  },
  COLD: {
    label: "Cold",
    description: "Scaled Down - 0 replicas",
    className: "text-cold",
  },
}

// Mode config with labels and gradients
export const modeConfig: Record<OperationalMode, { label: string; description: string; gradient: string }> = {
  MIXED_STREAM_BROWSING: {
    label: "Mixed Stream",
    description: "Browsing mixed content feed",
    gradient: "from-accent-primary/80 to-accent-secondary/60",
  },
  GAME_FOCUS_MODE: {
    label: "Game Focus",
    description: "Engaged in gaming content",
    gradient: "from-hot/80 to-warm/60",
  },
  AI_SERVICE_MODE: {
    label: "AI Service",
    description: "Using AI services",
    gradient: "from-accent-success/80 to-accent-secondary/60",
  },
}

// Content type config
export const contentTypeConfig: Record<ContentType, { label: string; gradient: string }> = {
  GAME: {
    label: "Game",
    gradient: "from-hot/80 to-warm/60",
  },
  AI_SERVICE: {
    label: "AI Service",
    gradient: "from-accent-success/80 to-accent-secondary/60",
  },
  VIDEO: {
    label: "Video",
    gradient: "from-cold/80 to-accent-secondary/60",
  },
}

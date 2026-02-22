import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Radio } from "lucide-react"

export function ServiceStatus() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="h-4 w-4 text-muted-foreground" />
          Service Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Service */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-elevated">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">AI Assistant</span>
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground">Always-on via Chat tab</p>
          </div>
          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 shrink-0">
            GPT-4o-mini
          </Badge>
        </div>

        {/* Video CDN */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-elevated">
          <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Video CDN</span>
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground">64+ videos via Supabase</p>
          </div>
          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 shrink-0">
            Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  SettingsIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  WarmIcon,
  ColdIcon,
  ResetIcon,
  TrendingUpIcon,
} from "@/components/icons"
import type { ContentItem, DemoControlPayload } from "@/types"

interface DemoControlsProps {
  content: ContentItem[]
  onDemoControl: (payload: DemoControlPayload) => void
  onResetDemo: () => void
}

export function DemoControls({ content, onDemoControl, onResetDemo }: DemoControlsProps) {
  const [selectedContent, setSelectedContent] = useState<string>("")
  const [viralScore, setViralScore] = useState<number>(0.9)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleTrendSpike = () => {
    if (!selectedContent) return
    onDemoControl({
      action: "trigger_trend_spike",
      target_content_id: selectedContent,
      value: viralScore,
    })
  }

  const handleForceWarm = () => {
    if (!selectedContent) return
    onDemoControl({
      action: "force_warm",
      target_content_id: selectedContent,
    })
  }

  const handleForceCold = () => {
    if (!selectedContent) return
    onDemoControl({
      action: "force_cold",
      target_content_id: selectedContent,
    })
  }

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                Demo Controls
              </div>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Content Selector */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Target Content</label>
              <Select value={selectedContent} onValueChange={setSelectedContent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content..." />
                </SelectTrigger>
                <SelectContent>
                  {content.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title} ({item.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Force State Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="warm"
                size="sm"
                onClick={handleForceWarm}
                disabled={!selectedContent}
                className="gap-2"
              >
                <WarmIcon className="h-4 w-4" />
                Force WARM
              </Button>
              <Button
                variant="cold"
                size="sm"
                onClick={handleForceCold}
                disabled={!selectedContent}
                className="gap-2"
              >
                <ColdIcon className="h-4 w-4" />
                Force COLD
              </Button>
            </div>

            {/* Viral Score Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Viral Score</label>
                <span className="text-sm font-mono text-foreground">
                  {(viralScore * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[viralScore]}
                onValueChange={([value]) => setViralScore(value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Trigger Trend Spike */}
            <Button
              onClick={handleTrendSpike}
              disabled={!selectedContent}
              className="w-full gap-2 bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-90"
            >
              <TrendingUpIcon className="h-4 w-4" />
              Trigger Trend Spike
            </Button>

            <Separator />

            {/* Reset Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={onResetDemo}
              className="w-full gap-2"
            >
              <ResetIcon className="h-4 w-4" />
              Reset Demo
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

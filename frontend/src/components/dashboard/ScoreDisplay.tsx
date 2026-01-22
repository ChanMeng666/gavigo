import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CombinedScoreBar } from "@/components/ui/score-bar"
import { ChartIcon, InfoIcon } from "@/components/icons"
import type { InputScores } from "@/types"

interface ScoreDisplayProps {
  scores: Record<string, InputScores>
  contentTitles: Record<string, string>
  thresholds?: {
    warmThreshold: number
    hotThreshold: number
  }
}

export function ScoreDisplay({
  scores,
  contentTitles,
  thresholds = { warmThreshold: 0.4, hotThreshold: 0.7 },
}: ScoreDisplayProps) {
  const scoreEntries = Object.entries(scores).sort(
    ([, a], [, b]) => b.combined_score - a.combined_score
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ChartIcon className="h-4 w-4 text-muted-foreground" />
          Real-time Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-3">
          {scoreEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ChartIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No score data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scoreEntries.map(([contentId, score]) => (
                <div key={contentId} className="bg-elevated rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                      {contentTitles[contentId] || contentId.slice(0, 8)}
                    </span>
                  </div>
                  <CombinedScoreBar
                    personalScore={score.personal_score}
                    globalScore={score.global_score}
                    combinedScore={score.combined_score}
                    warmThreshold={thresholds.warmThreshold}
                    hotThreshold={thresholds.hotThreshold}
                    animate={true}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator className="my-4" />

        {/* Thresholds Info */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <InfoIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="text-warm">WARM</span>: {(thresholds.warmThreshold * 100).toFixed(0)}%
            </span>
            <span>
              <span className="text-hot">HOT</span>: {(thresholds.hotThreshold * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

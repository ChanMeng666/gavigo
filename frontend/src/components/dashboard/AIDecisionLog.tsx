import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ActivityIcon, ClockIcon } from "@/components/icons"
import { actionIcons, triggerTypeConfig } from "@/components/icons"
import type { AIDecision } from "@/types"

interface AIDecisionLogProps {
  decisions: AIDecision[]
  maxItems?: number
}

export function AIDecisionLog({ decisions, maxItems = 20 }: AIDecisionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [decisions])

  const displayDecisions = decisions.slice(0, maxItems)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          AI Decision Log
          {displayDecisions.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {displayDecisions.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pb-4">
        <ScrollArea className="h-full pr-3" ref={scrollRef}>
          {displayDecisions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ActivityIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No decisions yet
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Interact with the stream to generate AI decisions
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {displayDecisions.map((decision, index) => {
                  const ActionIcon = actionIcons[decision.resulting_action]
                  const triggerConfig = triggerTypeConfig[decision.trigger_type]

                  return (
                    <motion.div
                      key={decision.decision_id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.02,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      className={`bg-elevated rounded-lg p-3 border-l-4 transition-colors hover:bg-overlay ${
                        decision.success ? "border-accent-success" : "border-destructive"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-md flex items-center justify-center ${
                            decision.success ? "bg-accent-success/10" : "bg-destructive/10"
                          }`}>
                            <ActionIcon className={`h-4 w-4 ${
                              decision.success ? "text-accent-success" : "text-destructive"
                            }`} />
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${triggerConfig.className}`}
                          >
                            {triggerConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <ClockIcon className="h-3 w-3" />
                          {new Date(decision.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Reasoning */}
                      <p className="text-sm text-foreground/80 mb-2">
                        {decision.reasoning_text}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="text-muted-foreground font-mono break-all">
                          {decision.affected_content_id}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-accent-primary">
                            P: {(decision.input_scores.personal_score * 100).toFixed(0)}%
                          </span>
                          <span className="text-accent-secondary">
                            G: {(decision.input_scores.global_score * 100).toFixed(0)}%
                          </span>
                          <span className={
                            decision.input_scores.combined_score >= 0.7
                              ? "text-hot"
                              : decision.input_scores.combined_score >= 0.4
                              ? "text-warm"
                              : "text-cold"
                          }>
                            C: {(decision.input_scores.combined_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

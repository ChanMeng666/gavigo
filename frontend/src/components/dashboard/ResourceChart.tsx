import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PulseIcon } from "@/components/icons"
import type { ResourceAllocation } from "@/types"

interface ResourceChartProps {
  history: ResourceAllocation[]
  maxPoints?: number
}

export function ResourceChart({ history, maxPoints = 30 }: ResourceChartProps) {
  const data = history.slice(-maxPoints).map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    active: r.active_allocation,
    warm: r.warm_allocation,
    background: r.background_allocation,
  }))

  const latestData = history[history.length - 1]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <PulseIcon className="h-4 w-4 text-muted-foreground" />
          Resource Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <PulseIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No resource data available</p>
          </div>
        ) : (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: "12px",
                    }}
                    labelStyle={{
                      color: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: "10px",
                      paddingTop: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(var(--status-hot))"
                    strokeWidth={2}
                    dot={false}
                    name="Active"
                  />
                  <Line
                    type="monotone"
                    dataKey="warm"
                    stroke="hsl(var(--status-warm))"
                    strokeWidth={2}
                    dot={false}
                    name="Warm"
                  />
                  <Line
                    type="monotone"
                    dataKey="background"
                    stroke="hsl(var(--status-cold))"
                    strokeWidth={2}
                    dot={false}
                    name="Background"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Current Values Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-hot/10 rounded-lg p-2 border border-hot/20">
                <p className="text-hot text-lg font-display font-bold">
                  {latestData?.active_allocation ?? 0}%
                </p>
                <p className="text-muted-foreground text-[10px]">Active</p>
              </div>
              <div className="bg-warm/10 rounded-lg p-2 border border-warm/20">
                <p className="text-warm text-lg font-display font-bold">
                  {latestData?.warm_allocation ?? 0}%
                </p>
                <p className="text-muted-foreground text-[10px]">Warm</p>
              </div>
              <div className="bg-cold/10 rounded-lg p-2 border border-cold/20">
                <p className="text-cold text-lg font-display font-bold">
                  {latestData?.background_allocation ?? 0}%
                </p>
                <p className="text-muted-foreground text-[10px]">Background</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

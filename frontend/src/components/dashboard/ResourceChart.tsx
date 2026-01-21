import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ResourceAllocation } from '../../types';

interface ResourceChartProps {
  history: ResourceAllocation[];
  maxPoints?: number;
}

export function ResourceChart({ history, maxPoints = 30 }: ResourceChartProps) {
  const data = history.slice(-maxPoints).map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    active: r.active_allocation,
    warm: r.warm_allocation,
    background: r.background_allocation,
  }));

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Resource Allocation</h3>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-500">
          No resource data available
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Active"
              />
              <Line
                type="monotone"
                dataKey="warm"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
                name="Warm"
              />
              <Line
                type="monotone"
                dataKey="background"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Background"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {history.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-500/20 rounded p-2">
            <p className="text-red-400 text-lg font-bold">
              {history[history.length - 1]?.active_allocation ?? 0}%
            </p>
            <p className="text-gray-500 text-xs">Active</p>
          </div>
          <div className="bg-yellow-500/20 rounded p-2">
            <p className="text-yellow-400 text-lg font-bold">
              {history[history.length - 1]?.warm_allocation ?? 0}%
            </p>
            <p className="text-gray-500 text-xs">Warm</p>
          </div>
          <div className="bg-blue-500/20 rounded p-2">
            <p className="text-blue-400 text-lg font-bold">
              {history[history.length - 1]?.background_allocation ?? 0}%
            </p>
            <p className="text-gray-500 text-xs">Background</p>
          </div>
        </div>
      )}
    </div>
  );
}

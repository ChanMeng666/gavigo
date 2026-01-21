import type { ContentItem, ContainerStatus as ContainerStatusType } from '../../types';

interface ContainerStatusProps {
  content: ContentItem[];
  containerStates: Record<string, ContainerStatusType>;
}

const statusColors: Record<ContainerStatusType, string> = {
  COLD: 'bg-blue-500',
  WARM: 'bg-yellow-500',
  HOT: 'bg-red-500',
};

const statusLabels: Record<ContainerStatusType, string> = {
  COLD: 'Cold (Scaled Down)',
  WARM: 'Warm (Standby)',
  HOT: 'Hot (Active)',
};

export function ContainerStatus({ content, containerStates }: ContainerStatusProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Container States</h3>
      <div className="space-y-3">
        {content.map((item) => {
          const status = containerStates[item.id] || item.container_status;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${statusColors[status]} animate-pulse`}
                />
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-gray-400 text-xs">{item.deployment_name}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    status === 'HOT'
                      ? 'bg-red-500/20 text-red-400'
                      : status === 'WARM'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {statusLabels[status]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-400">
              HOT: {Object.values(containerStates).filter((s) => s === 'HOT').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-400">
              WARM: {Object.values(containerStates).filter((s) => s === 'WARM').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-400">
              COLD: {Object.values(containerStates).filter((s) => s === 'COLD').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


import {
  ClipboardList,
  Clock,
  Wrench,
} from 'lucide-react';

interface MaintenanceStatisticsProps {
  totalRequests: number;
  pendingTasks: number;
  isLoading?: boolean;
}

function MaintenanceStatistics({
  totalRequests,
  pendingTasks,
  isLoading = false,
}: MaintenanceStatisticsProps) {
  const statistics = [
    {
      title: 'Total Requests',
      value: totalRequests,
      icon: ClipboardList,
      iconColor: 'text-blue-600',
      description: 'Your maintenance requests',
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      icon: Clock,
      iconColor: 'text-amber-500',
      description: 'Tasks requiring your action',
    },
    {
      title: 'Maintenance Workspace',
      value: 'Active',
      icon: Wrench,
      iconColor: 'text-green-600',
      description: 'Maintenance management',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {statistics.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <Icon
                className={stat.iconColor}
                size={21}
              />
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-800">
              {isLoading && typeof stat.value === 'number'
                ? '...'
                : stat.value}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {stat.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}

export default MaintenanceStatistics;

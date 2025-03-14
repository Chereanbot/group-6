import {
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineChartBar,
} from 'react-icons/hi';

interface MetricsProps {
  metrics: {
    totalCases: number;
    activeCases: number;
    pendingDocuments: number;
    upcomingAppointments: number;
    clientSatisfaction: number;
    responseRate: number;
  };
}

export function DashboardMetrics({ metrics }: MetricsProps) {
  const metricsData = [
    {
      title: 'Total Cases',
      value: metrics.totalCases,
      change: metrics.activeCases,
      icon: HiOutlineScale,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    },
    {
      title: 'Pending Documents',
      value: metrics.pendingDocuments,
      change: 0,
      icon: HiOutlineDocumentText,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-500/20',
    },
    {
      title: 'Upcoming Appointments',
      value: metrics.upcomingAppointments,
      change: 0,
      icon: HiOutlineCalendar,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-500/20',
    },
    {
      title: 'Response Rate',
      value: `${metrics.responseRate}%`,
      change: 0,
      icon: HiOutlineChartBar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {metric.value}
              </p>
            </div>
          </div>
          {metric.change > 0 && (
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active: {metric.change}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 
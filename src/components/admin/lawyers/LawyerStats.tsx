import { Card } from '@/components/ui/card';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  StarIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface LawyerStatsProps {
  stats: {
    overview: {
      totalLawyers: number;
      activeLawyers: number;
      inactiveLawyers: number;
      totalCases: number;
      pendingCases: number;
      completedCases: number;
      averageRating: number;
    };
  };
}

export function LawyerStats({ stats }: LawyerStatsProps) {
  const { overview } = stats;

  const statItems = [
    {
      label: 'Total Lawyers',
      value: overview.totalLawyers,
      icon: UserGroupIcon,
      change: '+5%',
      changeType: 'increase',
      description: 'Active legal professionals'
    },
    {
      label: 'Active Cases',
      value: overview.pendingCases,
      icon: BriefcaseIcon,
      change: '-2%',
      changeType: 'decrease',
      description: 'Ongoing legal cases'
    },
    {
      label: 'Average Rating',
      value: overview.averageRating.toFixed(1),
      icon: StarIcon,
      change: '+0.2',
      changeType: 'increase',
      description: 'Client satisfaction score'
    },
    {
      label: 'Case Success Rate',
      value: ((overview.completedCases / overview.totalCases) * 100).toFixed(0) + '%',
      icon: ChartBarIcon,
      change: '+3%',
      changeType: 'increase',
      description: 'Successfully resolved cases'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="p-6 bg-card dark:bg-card-dark border-border dark:border-border-dark">
          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary-dark/10">
              <item.icon className="w-6 h-6 text-primary dark:text-primary-dark" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">
                {item.label}
              </p>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
                  {item.value}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm font-medium ${
                    item.changeType === 'increase' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.change}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground dark:text-muted-foreground-dark">
                    {item.description}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 
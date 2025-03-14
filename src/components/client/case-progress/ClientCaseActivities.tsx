'use client';

import { formatDistanceToNow } from 'date-fns';
import { Activity, MessageSquare, FileText, Scale, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CaseActivity {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: Date;
  userId: string;
  caseId: string;
}

interface ClientCaseActivitiesProps {
  activities: CaseActivity[];
}

export function ClientCaseActivities({ activities }: ClientCaseActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'COMMUNICATION':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'DOCUMENT':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'SERVICE_DELIVERY':
        return <Scale className="h-4 w-4 text-purple-500" />;
      case 'COLLABORATION':
        return <Users className="h-4 w-4 text-orange-500" />;
      case 'SYSTEM_UPDATE':
        return <Activity className="h-4 w-4 text-cyan-500" />;
      case 'ALERT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'COMMUNICATION':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'DOCUMENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'SERVICE_DELIVERY':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'COLLABORATION':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'SYSTEM_UPDATE':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
      case 'ALERT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No recent activities
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="mt-1">{getActivityIcon(activity.type)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{activity.title}</p>
              <Badge variant="secondary" className={getActivityColor(activity.type)}>
                {activity.type.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 
import { CaseActivity } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { FileText, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CaseActivitiesProps {
  activities: CaseActivity[];
}

export default function CaseActivities({ activities }: CaseActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT_ADDED':
        return <FileText className="h-4 w-4" />;
      case 'STATUS_CHANGE':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 
'use client';

import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  File,
  Activity
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: Date;
    createdBy: {
      fullName: string;
      role: string;
    };
    case: {
      id: string;
      title: string;
      status: string;
      priority: string;
      client: {
        fullName: string;
      };
    };
  }>;
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    const icons = {
      DOCUMENT_UPLOADED: File,
      MESSAGE_SENT: MessageSquare,
      STATUS_CHANGED: Activity,
      APPOINTMENT_SCHEDULED: Calendar,
      CLIENT_ADDED: User,
      CASE_CREATED: FileText,
    };
    const IconComponent = icons[type] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800',
      URGENT: 'bg-purple-100 text-purple-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          <div className="mt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              {getActivityIcon(activity.type)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/lawyer/cases/${activity.case.id}`}
                className="font-medium hover:text-blue-600 hover:underline"
              >
                {activity.case.title}
              </Link>
              <Badge className={getStatusColor(activity.case.status)}>
                {activity.case.status}
              </Badge>
              <Badge className={getPriorityColor(activity.case.priority)}>
                {activity.case.priority}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {activity.createdBy.fullName} ({activity.createdBy.role.toLowerCase()})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Client: {activity.case.client.fullName}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
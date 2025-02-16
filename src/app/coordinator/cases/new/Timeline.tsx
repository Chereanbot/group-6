import React from 'react';
import { format } from 'date-fns';
import {
  HiOutlineDocumentAdd,
  HiOutlineAnnotation,
  HiOutlineUserAdd,
  HiOutlineStatusOnline,
  HiOutlineOfficeBuilding,
  HiOutlineTag
} from 'react-icons/hi';

interface TimelineProps {
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: Date;
    metadata?: any;
    user?: {
      id: string;
      fullName: string;
      email: string;
      userRole: string;
    };
  }>;
}

const activityIcons: Record<string, React.ReactNode> = {
  CREATION: <HiOutlineDocumentAdd className="h-5 w-5" />,
  NOTE: <HiOutlineAnnotation className="h-5 w-5" />,
  ASSIGNMENT: <HiOutlineUserAdd className="h-5 w-5" />,
  STATUS_CHANGE: <HiOutlineStatusOnline className="h-5 w-5" />,
  OFFICE_CHANGE: <HiOutlineOfficeBuilding className="h-5 w-5" />,
  TAG_UPDATE: <HiOutlineTag className="h-5 w-5" />
};

export const Timeline: React.FC<TimelineProps> = ({ activities }) => {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    {activityIcons[activity.type] || <HiOutlineDocumentAdd className="h-5 w-5" />}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {activity.title}{' '}
                      <span className="font-medium text-gray-900">
                        {activity.description}
                      </span>
                    </p>
                    {activity.metadata && (
                      <div className="mt-2 text-sm text-gray-500">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <p key={key} className="capitalize">
                            {key.replace(/_/g, ' ')}: {value as string}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={activity.createdAt.toISOString()}>
                      {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
                    </time>
                    {activity.user && (
                      <p className="text-xs text-gray-400">
                        by {activity.user.fullName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 
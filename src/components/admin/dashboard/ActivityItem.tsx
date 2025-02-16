interface ActivityItemProps {
  activity: {
    id: string;
    action: string;
    details: any;
    timestamp: Date;
    user: {
      name: string;
      role: string;
    };
  };
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const getActivityIcon = () => {
    // Add logic to return different icons based on activity type
    return '📋';
  };

  const formatTime = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      -Math.round((Date.now() - new Date(date).getTime()) / (1000 * 60)),
      'minutes'
    );
  };

  return (
    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {activity.user.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activity.action}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {formatTime(activity.timestamp)}
        </p>
      </div>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
        {activity.user.role}
      </span>
    </div>
  );
};

export default ActivityItem; 
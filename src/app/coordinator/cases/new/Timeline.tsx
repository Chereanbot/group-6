import { motion } from 'framer-motion';
import {
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineClipboardCheck,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  status: 'completed' | 'current' | 'upcoming';
  icon?: string;
  details?: {
    assignedTo?: string;
    location?: string;
    documents?: string[];
    notes?: string;
  };
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const getStatusIcon = (status: TimelineEvent['status'], icon?: string) => {
    if (icon) {
      switch (icon) {
        case 'DOCUMENT':
          return <HiOutlineDocumentText className={`h-6 w-6 ${getIconColor(status)}`} />;
        case 'USER':
          return <HiOutlineUserGroup className={`h-6 w-6 ${getIconColor(status)}`} />;
        case 'VERIFY':
          return <HiOutlineClipboardCheck className={`h-6 w-6 ${getIconColor(status)}`} />;
        case 'OFFICE':
          return <HiOutlineOfficeBuilding className={`h-6 w-6 ${getIconColor(status)}`} />;
        default:
          break;
      }
    }

    switch (status) {
      case 'completed':
        return <HiOutlineCheck className="h-6 w-6 text-green-500" />;
      case 'current':
        return <HiOutlineClock className="h-6 w-6 text-blue-500 animate-pulse" />;
      case 'upcoming':
        return <HiOutlineArrowRight className="h-6 w-6 text-gray-400" />;
    }
  };

  const getIconColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'current':
        return 'text-blue-500';
      case 'upcoming':
        return 'text-gray-400';
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500';
      case 'upcoming':
        return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Case Registration Timeline
      </h2>
      <div className="space-y-8">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Connector Line */}
            {index < events.length - 1 && (
              <div
                className={`absolute left-6 top-10 w-0.5 h-full -ml-px ${
                  event.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}

            <div className="flex items-start group">
              {/* Status Icon */}
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full ${
                  getStatusColor(event.status)
                } bg-opacity-10 transition-all duration-300 group-hover:scale-110`}
              >
                {getStatusIcon(event.status, event.icon)}
              </div>

              {/* Event Content */}
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  {event.title}
                  {event.status === 'current' && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                      In Progress
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {event.description}
                </p>
                
                {/* Additional Details */}
                {event.details && (
                  <div className="mt-3 space-y-2">
                    {event.details.assignedTo && (
                      <div className="flex items-center text-sm text-gray-500">
                        <HiOutlineUserGroup className="h-4 w-4 mr-2" />
                        <span>Assigned to: {event.details.assignedTo}</span>
                      </div>
                    )}
                    {event.details.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <HiOutlineOfficeBuilding className="h-4 w-4 mr-2" />
                        <span>Location: {event.details.location}</span>
                      </div>
                    )}
                    {event.details.documents && event.details.documents.length > 0 && (
                      <div className="flex items-start text-sm text-gray-500">
                        <HiOutlineDocumentText className="h-4 w-4 mr-2 mt-1" />
                        <div>
                          <span>Required Documents:</span>
                          <ul className="ml-6 list-disc">
                            {event.details.documents.map((doc, idx) => (
                              <li key={idx}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {event.details.notes && (
                      <div className="text-sm text-gray-500 italic">
                        Note: {event.details.notes}
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  {event.date.toLocaleDateString()} at{' '}
                  {event.date.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 
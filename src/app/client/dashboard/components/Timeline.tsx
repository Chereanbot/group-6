import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineChat,
  HiChevronRight,
  HiChevronDown
} from 'react-icons/hi';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type: 'CASE_UPDATE' | 'APPOINTMENT' | 'DOCUMENT' | 'PAYMENT' | 'MESSAGE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  date: string;
  metadata?: {
    caseId?: string;
    documentUrl?: string;
    appointmentId?: string;
    amount?: number;
    paymentId?: string;
  };
}

interface TimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

export const Timeline = ({ events, onEventClick }: TimelineProps) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'CASE_UPDATE':
        return <HiOutlineScale className="w-5 h-5" />;
      case 'APPOINTMENT':
        return <HiOutlineClock className="w-5 h-5" />;
      case 'DOCUMENT':
        return <HiOutlineDocumentText className="w-5 h-5" />;
      case 'MESSAGE':
        return <HiOutlineChat className="w-5 h-5" />;
      default:
        return <HiOutlineDocumentText className="w-5 h-5" />;
    }
  };

  const getEventColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Case Timeline</h2>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            variants={item}
            className="relative pl-8 pb-8 last:pb-0"
          >
            {/* Timeline line */}
            {index !== events.length - 1 && (
              <div className="absolute left-[1.3rem] top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Event dot */}
            <div className={`absolute left-0 top-2 w-6 h-6 rounded-full ${getEventColor(event.status)} flex items-center justify-center`}>
              {getEventIcon(event.type)}
            </div>

            {/* Event content */}
            <div className="ml-4">
              <button
                onClick={() => toggleEvent(event.id)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg group-hover:text-primary-500 transition-colors">
                    {event.title}
                  </h3>
                  {expandedEvents.has(event.id) ? (
                    <HiChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <HiChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                </p>
              </button>

              <AnimatePresence>
                {expandedEvents.has(event.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-3">
                      <p className="text-gray-600 dark:text-gray-400">
                        {event.description}
                      </p>
                      {event.metadata && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
                          {event.metadata.caseId && (
                            <p>Case ID: {event.metadata.caseId}</p>
                          )}
                          {event.metadata.amount && (
                            <p>Amount: {event.metadata.amount.toLocaleString()} ETB</p>
                          )}
                          {event.metadata.documentUrl && (
                            <a
                              href={event.metadata.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 hover:text-primary-600"
                            >
                              View Document
                            </a>
                          )}
                        </div>
                      )}
                      {onEventClick && (
                        <button
                          onClick={() => onEventClick(event)}
                          className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                          View Details →
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}; 
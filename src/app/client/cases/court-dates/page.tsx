"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineBell,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX
} from 'react-icons/hi';

interface CourtDate {
  id: string;
  date: string;
  time: string;
  type: string;
  location: string;
  judge: string;
  lawyer: string;
  documents: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  description?: string;
}

const mockDates: CourtDate[] = [
  {
    id: '1',
    date: '2024-03-15',
    time: '10:00 AM',
    type: 'Initial Hearing',
    location: 'Federal High Court - Room 302',
    judge: 'Hon. Judge Smith',
    lawyer: 'John Doe',
    documents: ['Case Summary', 'Evidence List'],
    status: 'upcoming',
    description: 'First court appearance for property dispute case'
  },
  {
    id: '2',
    date: '2024-03-20',
    time: '02:30 PM',
    type: 'Motion Hearing',
    location: 'Federal High Court - Room 405',
    judge: 'Hon. Judge Johnson',
    lawyer: 'Jane Smith',
    documents: ['Motion Papers', 'Supporting Documents'],
    status: 'upcoming',
    description: 'Hearing for preliminary motions'
  }
];

const CourtDates = () => {
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CourtDate | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const renderCalendar = () => {
    const { days, firstDay } = getDaysInMonth(currentMonth);
    const weeks = [];
    let days_array = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days_array.push(<td key={`empty-${i}`} className="p-2" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= days; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const hasEvent = mockDates.some(event => event.date === dateString);

      days_array.push(
        <td key={day} className="p-2">
          <button
            onClick={() => setSelectedDate(dateString)}
            className={`w-full aspect-square rounded-lg p-2 relative
              ${hasEvent ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
              ${selectedDate === dateString ? 'ring-2 ring-primary-500' : ''}`}
          >
            <span className="relative z-10">{day}</span>
            {hasEvent && (
              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2
                w-1.5 h-1.5 rounded-full bg-primary-500" />
            )}
          </button>
        </td>
      );

      if (days_array.length === 7) {
        weeks.push(
          <tr key={`week-${weeks.length}`}>
            {days_array}
          </tr>
        );
        days_array = [];
      }
    }

    if (days_array.length > 0) {
      weeks.push(
        <tr key={`week-${weeks.length}`}>
          {days_array}
          {Array(7 - days_array.length).fill(null).map((_, i) => (
            <td key={`empty-end-${i}`} className="p-2" />
          ))}
        </tr>
      );
    }

    return weeks;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Court Dates</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and track your upcoming court appearances
        </p>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2
              ${view === 'calendar' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            <HiOutlineCalendar className="w-5 h-5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2
              ${view === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            <HiOutlineDocumentText className="w-5 h-5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <table className="w-full">
            <thead>
              <tr>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <th key={day} className="p-2 text-sm font-medium">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderCalendar()}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {mockDates.map((date) => (
            <motion.div
              key={date.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              {/* Event Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{date.type}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs capitalize
                    ${getStatusColor(date.status)}`}>
                    {date.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <HiOutlineCalendar className="w-4 h-4 mr-1" />
                    {date.date}
                  </span>
                  <span className="flex items-center">
                    <HiOutlineClock className="w-4 h-4 mr-1" />
                    {date.time}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Location
                    </h4>
                    <p className="flex items-center text-gray-800 dark:text-gray-200">
                      <HiOutlineLocationMarker className="w-5 h-5 mr-2 text-primary-500" />
                      {date.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Judge
                    </h4>
                    <p className="flex items-center text-gray-800 dark:text-gray-200">
                      <HiOutlineUserGroup className="w-5 h-5 mr-2 text-primary-500" />
                      {date.judge}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Required Documents
                  </h4>
                  <div className="space-y-2">
                    {date.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 
                          bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <span className="flex items-center">
                          <HiOutlineDocumentText className="w-5 h-5 mr-2 text-primary-500" />
                          {doc}
                        </span>
                        <button className="text-primary-500 hover:text-primary-600">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 
                border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end space-x-4">
                  <button className="flex items-center space-x-2 text-primary-500 hover:text-primary-600">
                    <HiOutlineBell className="w-5 h-5" />
                    <span>Set Reminder</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-primary-500 text-white 
                    px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                    <HiOutlineCalendar className="w-5 h-5" />
                    <span>Add to Calendar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4"
          >
            {/* Modal content here */}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CourtDates; 
"use client";

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineScale
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { FilterPanel } from '@/components/lawyer/calendar/FilterPanel';
import { CalendarToolbar } from '@/components/lawyer/calendar/CalendarToolbar';
import { AddEventModal } from '@/components/lawyer/calendar/AddEventModal';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'HEARING' | 'APPOINTMENT' | 'MEETING' | 'DEADLINE';
  description?: string;
  location?: string;
  participants?: string[];
  caseId?: string;
  caseName?: string;
  documents?: {
    id: string;
    name: string;
    url: string;
  }[];
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';
}

export default function LawyerCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState({
    types: [] as string[],
    status: [] as string[]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [initialEventData, setInitialEventData] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lawyer/calendar/events');
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        })));
      } else {
        throw new Error(data.error || 'Failed to load events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleAddEvent = async (eventData: EventData) => {
    try {
      const response = await fetch('/api/lawyer/calendar/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...eventData,
          start: eventData.start.toISOString(),
          end: eventData.end.toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to add events');
        }
        throw new Error(data.message || 'Failed to add event');
      }

      setEvents(prev => [...prev, {
        ...data,
        start: new Date(data.start),
        end: new Date(data.end)
      }]);
      
      toast.success('Event added successfully');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add event');
      throw error;
    }
  };

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#3B82F6'; // Default blue

    switch (event.type) {
      case 'HEARING':
        backgroundColor = '#EF4444'; // Red
        break;
      case 'APPOINTMENT':
        backgroundColor = '#10B981'; // Green
        break;
      case 'MEETING':
        backgroundColor = '#F59E0B'; // Yellow
        break;
      case 'DEADLINE':
        backgroundColor = '#6366F1'; // Indigo
        break;
    }

    if (event.status === 'CANCELLED') {
      backgroundColor = '#6B7280'; // Gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.status === 'CANCELLED' ? 0.6 : 1,
        color: '#fff',
        border: 'none',
        display: 'block'
      }
    };
  };

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    if (filters.types.length && !filters.types.includes(event.type)) return false;
    if (filters.status.length && !filters.status.includes(event.status)) return false;
    return true;
  });

  // Custom toolbar component
  const CustomToolbar = (toolbarProps: any) => (
    <CalendarToolbar {...toolbarProps} />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your schedule and appointments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Event
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <HiOutlineFilter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <HiOutlineCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Events</p>
              <p className="text-2xl font-bold">{events.filter(e => 
                format(e.start, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <HiOutlineScale className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Hearings</p>
              <p className="text-2xl font-bold">{events.filter(e => 
                e.type === 'HEARING' && e.start > new Date()
              ).length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <HiOutlineUserGroup className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Appointments</p>
              <p className="text-2xl font-bold">{events.filter(e => 
                e.type === 'APPOINTMENT' && e.status === 'PENDING'
              ).length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <HiOutlineClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Deadlines</p>
              <p className="text-2xl font-bold">{events.filter(e => 
                e.type === 'DEADLINE' && e.start > new Date()
              ).length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 300px)' }}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
          view={view as any}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={setDate}
          components={{
            toolbar: CustomToolbar
          }}
          popup
          selectable
          onSelectSlot={(slotInfo) => {
            setShowAddModal(true);
            // Pre-fill the start and end times
            setInitialEventData({
              start: slotInfo.start,
              end: slotInfo.end
            });
          }}
        />
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
          onUpdate={loadEvents}
        />
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEvent}
          initialData={initialEventData || undefined}
        />
      )}

      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
} 
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineViewList,
  HiOutlineViewGrid,
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Appointment {
  id: string;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  coordinator: {
    id: string;
    fullName: string;
    email: string;
  };
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  caseType: string;
  venue: string;
  priority: string;
  requiredDocuments?: string;
  serviceRequest?: {
    id: string;
    title: string;
    status: string;
  };
}

export default function ClientAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState('week');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/coordinator/clients/appointments', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/coordinator/clients/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      const updatedAppointment = await response.json();
      setAppointments(appointments.map(apt => 
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      ));
      toast.success(`Appointment marked as ${newStatus.toLowerCase()}`);
      setShowAppointmentModal(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const response = await fetch(`/api/coordinator/clients/appointments?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      setAppointments(appointments.filter(apt => apt.id !== id));
      toast.success('Appointment deleted successfully');
      setSelectedAppointment(null);
      setShowAppointmentModal(false);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <HiOutlineCalendar className="h-5 w-5" />;
      case 'COMPLETED':
        return <HiOutlineCheckCircle className="h-5 w-5" />;
      case 'CANCELLED':
        return <HiOutlineXCircle className="h-5 w-5" />;
      default:
        return <HiOutlineExclamationCircle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'HIGH':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    
    return appointments.filter(apt => {
      if (!apt || !apt.client) return false;
      
      const matchesSearch = (apt.client?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (apt.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      
      let matchesDate = true;
      const appointmentDate = new Date(apt.scheduledTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case 'today':
          matchesDate = appointmentDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAhead = new Date(today);
          weekAhead.setDate(today.getDate() + 7);
          matchesDate = appointmentDate >= today && appointmentDate <= weekAhead;
          break;
        case 'month':
          const monthAhead = new Date(today);
          monthAhead.setMonth(today.getMonth() + 1);
          matchesDate = appointmentDate >= today && appointmentDate <= monthAhead;
          break;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const calendarEvents = useMemo(() => {
    return filteredAppointments.map(apt => ({
      id: apt.id,
      title: `${apt.client.fullName} - ${apt.purpose}`,
      start: new Date(apt.scheduledTime),
      end: new Date(new Date(apt.scheduledTime).getTime() + apt.duration * 60000),
      resource: apt,
    }));
  }, [filteredAppointments]);

  const eventStyleGetter = (event: any) => {
    const style: any = {
      backgroundColor: '#4F46E5',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0',
      display: 'block',
    };

    if (event.resource.status === 'CANCELLED') {
      style.backgroundColor = '#EF4444';
    } else if (event.resource.status === 'COMPLETED') {
      style.backgroundColor = '#10B981';
    }

    if (event.resource.priority === 'HIGH') {
      style.borderLeft = '3px solid #FBBF24';
    } else if (event.resource.priority === 'URGENT') {
      style.borderLeft = '3px solid #EF4444';
    }

    return { style };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Client Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and track all client appointments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/coordinator/clients/appointments/new')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg 
              hover:bg-indigo-700 transition-colors duration-200"
          >
            <HiOutlinePlus className="w-5 h-5 mr-2" />
            New Appointment
          </button>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded ${view === 'calendar' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
              title="Calendar View"
            >
              <HiOutlineViewGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
              title="List View"
            >
              <HiOutlineViewList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
            focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as any)}
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
            focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">Next 7 Days</option>
          <option value="month">Next 30 Days</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : view === 'calendar' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => {
              setSelectedAppointment(event.resource);
              setShowAppointmentModal(true);
            }}
            view={calendarView as any}
            onView={(view) => setCalendarView(view)}
            views={['month', 'week', 'day']}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAppointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {appointment.client.fullName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.purpose}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(appointment.priority)}`}>
                        {appointment.priority}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {moment(appointment.scheduledTime).format('MMM D, YYYY')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineClock className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {moment(appointment.scheduledTime).format('h:mm A')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineLocationMarker className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.venue}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlinePhone className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.client.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowAppointmentModal(true);
                    }}
                    className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 
                      rounded-lg transition-colors duration-200 border border-indigo-200 dark:border-indigo-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <HiOutlineCalendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating a new appointment'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {showAppointmentModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Appointment Details
                  </h2>
                  <button
                    onClick={() => setShowAppointmentModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Client Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedAppointment.client.fullName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlinePhone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedAppointment.client.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineMail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedAppointment.client.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Appointment Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date & Time
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {moment(selectedAppointment.scheduledTime).format('MMM D, YYYY h:mm A')}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Duration
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedAppointment.duration} minutes
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Case Type
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedAppointment.caseType}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Venue
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedAppointment.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Purpose
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedAppointment.purpose}
                    </p>
                  </div>
                  {selectedAppointment.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Notes
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'COMPLETED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedAppointment.status === 'COMPLETED'}
                      >
                        Mark as Completed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'CANCELLED')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedAppointment.status === 'CANCELLED'}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 
                        rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 
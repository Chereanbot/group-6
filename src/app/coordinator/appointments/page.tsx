"use client";

import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineBell,
  HiOutlineCog,
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import NotificationSettings from '@/components/NotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const localizer = momentLocalizer(moment);

interface Appointment {
  id: string;
  clientId: string;
  coordinatorId: string;
  client: {
    name: string;
    email: string;
  };
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [coordinatorId, setCoordinatorId] = useState<string>(''); // You'll need to get this from your auth context

  useEffect(() => {
    fetchAppointments();
    // Get coordinator ID from your auth context
    // setCoordinatorId(authContext.user.id);
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/coordinator/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const handleCreateAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      const response = await fetch('/api/coordinator/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      const data = await response.json();
      setAppointments([...appointments, data]);
      setShowAppointmentModal(false);
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const handleUpdateAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      const response = await fetch('/api/coordinator/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      const data = await response.json();
      setAppointments(appointments.map(apt => 
        apt.id === data.id ? data : apt
      ));
      setShowAppointmentModal(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await fetch(`/api/coordinator/appointments?id=${id}`, {
        method: 'DELETE',
      });
      setAppointments(appointments.filter(apt => apt.id !== id));
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const calendarEvents = appointments.map(apt => ({
    id: apt.id,
    title: `${apt.client.name} - ${apt.purpose}`,
    start: new Date(apt.scheduledTime),
    end: new Date(new Date(apt.scheduledTime).getTime() + apt.duration * 60000),
    appointment: apt,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and schedule client appointments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsNewAppointment(true);
              setSelectedAppointment(null);
              setShowAppointmentModal(true);
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
              transition-colors duration-200 flex items-center gap-2"
          >
            <HiOutlinePlus className="h-5 w-5" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 right-0 p-4 flex items-center gap-4">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 
            rounded-full transition-colors duration-200"
          title="Settings"
        >
          <HiOutlineCog className="h-6 w-6" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <HiOutlineCalendar className="h-5 w-5" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <HiOutlineBell className="h-5 w-5" />
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          {/* Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-[600px]">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={(event) => {
                setIsNewAppointment(false);
                setSelectedAppointment(event.appointment);
                setShowAppointmentModal(true);
              }}
              style={{ height: '100%' }}
            />
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="flex justify-center">
            <NotificationSettings userId={coordinatorId} userType="coordinator" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Appointment Settings
                </h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Default Appointment Duration</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Working Hours</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Start Time</label>
                        <input type="time" className="w-full p-2 border rounded-md" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">End Time</label>
                        <input type="time" className="w-full p-2 border rounded-md" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Calendar View</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="month">Month</option>
                      <option value="week">Week</option>
                      <option value="day">Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Show weekends</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Auto-accept appointments</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button 
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Modal */}
      <AnimatePresence>
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isNewAppointment ? 'New Appointment' : 'Edit Appointment'}
                </h2>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  ×
                </button>
              </div>

              {/* Appointment Form */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Select client..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </label>
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time
                    </label>
                    <input
                      type="time"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Purpose
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Purpose of appointment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                  >
                    {isNewAppointment ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 
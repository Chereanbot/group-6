"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlineLocationMarker,
  HiOutlineVideoCamera,
  HiOutlinePhone,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineExclamation
} from 'react-icons/hi';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  avatar?: string;
  availableDates: string[];
}

const mockLawyers: Lawyer[] = [
  {
    id: '1',
    name: 'John Doe',
    specialization: 'Criminal Law',
    availableDates: ['2024-03-15', '2024-03-16', '2024-03-17']
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    specialization: 'Family Law',
    availableDates: ['2024-03-16', '2024-03-18', '2024-03-19']
  }
];

const timeSlots: TimeSlot[] = [
  { id: '1', time: '09:00 AM', available: true },
  { id: '2', time: '10:00 AM', available: true },
  { id: '3', time: '11:00 AM', available: false },
  { id: '4', time: '02:00 PM', available: true },
  { id: '5', time: '03:00 PM', available: true }
];

const AppointmentRequest = () => {
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'video' | 'voice' | 'in-person'>('video');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Request Appointment</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Schedule a meeting with your legal team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lawyer Selection */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Lawyer</h2>
            <div className="space-y-3">
              {mockLawyers.map((lawyer) => (
                <motion.button
                  key={lawyer.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedLawyer(lawyer.id)}
                  className={`w-full p-4 rounded-xl border ${
                    selectedLawyer === lawyer.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  } flex items-center space-x-4`}
                >
                  <div className="flex-shrink-0">
                    {lawyer.avatar ? (
                      <img
                        src={lawyer.avatar}
                        alt={lawyer.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30
                        flex items-center justify-center">
                        <HiOutlineUserCircle className="w-6 h-6 text-primary-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium">{lawyer.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {lawyer.specialization}
                    </p>
                  </div>
                  {selectedLawyer === lawyer.id && (
                    <HiOutlineCheck className="w-6 h-6 text-primary-500" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          {selectedLawyer && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Date</h2>
              <div className="grid grid-cols-3 gap-3">
                {mockLawyers
                  .find(l => l.id === selectedLawyer)
                  ?.availableDates.map((date) => (
                    <motion.button
                      key={date}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg border ${
                        selectedDate === date
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </motion.button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Time and Type Selection */}
        <div className="space-y-6">
          {selectedDate && (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-4">Select Time</h2>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <motion.button
                      key={slot.id}
                      whileHover={slot.available ? { scale: 1.02 } : {}}
                      whileTap={slot.available ? { scale: 0.98 } : {}}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border ${
                        !slot.available
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : selectedTime === slot.time
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {slot.time}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Appointment Type</h2>
                <div className="grid grid-cols-3 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAppointmentType('video')}
                    className={`p-4 rounded-lg border flex flex-col items-center space-y-2 ${
                      appointmentType === 'video'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <HiOutlineVideoCamera className="w-6 h-6" />
                    <span>Video Call</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAppointmentType('voice')}
                    className={`p-4 rounded-lg border flex flex-col items-center space-y-2 ${
                      appointmentType === 'voice'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <HiOutlinePhone className="w-6 h-6" />
                    <span>Voice Call</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAppointmentType('in-person')}
                    className={`p-4 rounded-lg border flex flex-col items-center space-y-2 ${
                      appointmentType === 'in-person'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <HiOutlineLocationMarker className="w-6 h-6" />
                    <span>In Person</span>
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {selectedTime && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full p-4 bg-primary-500 text-white rounded-lg
                hover:bg-primary-600 transition-colors mt-8"
            >
              Request Appointment
            </motion.button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Confirm Appointment</h2>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400
                    dark:hover:text-gray-200"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <HiOutlineCalendar className="w-5 h-5 text-primary-500" />
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-2">
                    <HiOutlineClock className="w-5 h-5 text-primary-500" />
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <HiOutlineUserCircle className="w-5 h-5 text-primary-500" />
                    <span>{mockLawyers.find(l => l.id === selectedLawyer)?.name}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  By confirming, you agree to our scheduling policies. You can cancel
                  or reschedule up to 24 hours before the appointment.
                </p>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400
                      hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg
                      hover:bg-primary-600 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentRequest; 
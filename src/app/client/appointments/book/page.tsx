"use client";

import { useState } from 'react';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineUserGroup } from 'react-icons/hi';

const BookAppointment = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [appointmentType, setAppointmentType] = useState('');

  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const lawyers = [
    { id: '1', name: 'John Doe', specialization: 'Criminal Law' },
    { id: '2', name: 'Jane Smith', specialization: 'Family Law' },
    { id: '3', name: 'Mike Johnson', specialization: 'Corporate Law' }
  ];

  const appointmentTypes = [
    'Initial Consultation',
    'Case Review',
    'Document Review',
    'Settlement Discussion',
    'Court Preparation'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

      <div className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Time
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-2 rounded-lg border text-sm
                  ${selectedTime === time 
                    ? 'bg-primary-500 text-white border-primary-500' 
                    : 'hover:border-primary-500'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Lawyer Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Lawyer
          </label>
          <div className="space-y-2">
            {lawyers.map((lawyer) => (
              <button
                key={lawyer.id}
                onClick={() => setSelectedLawyer(lawyer.id)}
                className={`w-full p-4 rounded-lg border text-left
                  ${selectedLawyer === lawyer.id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'hover:border-primary-500'}`}
              >
                <p className="font-medium">{lawyer.name}</p>
                <p className="text-sm text-gray-600">
                  {lawyer.specialization}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Appointment Type
          </label>
          <select
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select type</option>
            {appointmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Book Button */}
        <button
          className="w-full bg-primary-500 text-white py-3 rounded-lg
            hover:bg-primary-600 transition-colors disabled:opacity-50"
          disabled={!selectedDate || !selectedTime || !selectedLawyer || !appointmentType}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default BookAppointment; 
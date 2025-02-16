"use client";

import { useState } from 'react';
import { 
  HiOutlineCalendar, 
  HiOutlineCash,
  HiOutlineChat,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineUserGroup,
  HiOutlineBell,
  HiOutlineExclamation,
  HiOutlineDocumentDuplicate,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePlusCircle,
  HiOutlineInformationCircle,
  HiOutlineTrash
} from 'react-icons/hi';
import { MoreOptionsMenu } from '@/components/ui/MoreOptionsMenu';

const Dashboard = () => {
  const [nextAppointment] = useState({
    date: '2024-03-10',
    time: '10:00 AM',
    lawyer: 'John Doe',
    type: 'Case Review'
  });

  const [recentPayments] = useState([
    {
      id: 'PAY-123',
      date: '2024-03-05',
      amount: 1500,
      status: 'completed'
    },
    // Add more payments...
  ]);

  const [caseStatus] = useState({
    caseNumber: 'CASE-2024-001',
    status: 'In Progress',
    nextHearing: '2024-03-15',
    assignedLawyer: 'Jane Smith'
  });

  const [notifications] = useState([
    {
      id: 1,
      type: 'urgent',
      message: 'Document submission deadline approaching',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'info',
      message: 'New message from your lawyer',
      time: '1 day ago'
    }
  ]);

  const [importantDates] = useState([
    {
      date: '2024-03-15',
      event: 'Court Hearing',
      location: 'Federal High Court'
    },
    {
      date: '2024-03-20',
      event: 'Document Deadline',
      description: 'Submit financial documents'
    }
  ]);

  const [lawyerContact] = useState({
    name: 'Jane Smith',
    phone: '+251 911 123 456',
    email: 'jane.smith@dulacms.com',
    office: 'Bole, Addis Ababa'
  });

  return (
    <div className="p-6">
      {/* Welcome and Stats Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Client Name</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's an overview of your legal matters
            </p>
          </div>
          <div className="relative">
            <button className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow">
              <HiOutlineBell className="w-6 h-6 text-primary-500" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Cases</p>
            <p className="text-2xl font-bold text-primary-500">2</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Documents</p>
            <p className="text-2xl font-bold text-yellow-500">3</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Hearings</p>
            <p className="text-2xl font-bold text-blue-500">1</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
            <p className="text-2xl font-bold text-green-500">5</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
          <HiOutlinePlusCircle className="w-6 h-6 text-primary-500 mb-2" />
          <span className="text-sm font-medium">Book Appointment</span>
        </button>
        <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
          <HiOutlineCash className="w-6 h-6 text-primary-500 mb-2" />
          <span className="text-sm font-medium">Make Payment</span>
        </button>
        <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
          <HiOutlineChat className="w-6 h-6 text-primary-500 mb-2" />
          <span className="text-sm font-medium">Message Lawyer</span>
        </button>
        <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
          <HiOutlineDocumentText className="w-6 h-6 text-primary-500 mb-2" />
          <span className="text-sm font-medium">Submit Document</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Next Appointment */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <HiOutlineCalendar className="w-6 h-6 text-primary-500" />
                <h2 className="text-lg font-semibold">Next Appointment</h2>
              </div>
              <MoreOptionsMenu options={[
                {
                  label: 'Reschedule',
                  icon: <HiOutlineCalendar className="w-5 h-5" />,
                  onClick: () => console.log('Reschedule clicked')
                },
                {
                  label: 'Cancel',
                  icon: <HiOutlineTrash className="w-5 h-5" />,
                  onClick: () => console.log('Cancel clicked'),
                  variant: 'danger'
                }
              ]} />
            </div>
            {nextAppointment ? (
              <>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary-500">
                    {nextAppointment.date}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {nextAppointment.time}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <HiOutlineUserGroup className="w-5 h-5 mr-2" />
                    {nextAppointment.lawyer}
                  </p>
                  <p className="flex items-center">
                    <HiOutlineClipboardCheck className="w-5 h-5 mr-2" />
                    {nextAppointment.type}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No upcoming appointments
              </p>
            )}
          </div>

          {/* Lawyer Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Your Lawyer</h2>
              <HiOutlineUserGroup className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-3">
              <p className="font-medium text-lg">{lawyerContact.name}</p>
              <p className="flex items-center text-gray-600 dark:text-gray-400">
                <HiOutlinePhone className="w-5 h-5 mr-2" />
                {lawyerContact.phone}
              </p>
              <p className="flex items-center text-gray-600 dark:text-gray-400">
                <HiOutlineMail className="w-5 h-5 mr-2" />
                {lawyerContact.email}
              </p>
              <p className="flex items-center text-gray-600 dark:text-gray-400">
                <HiOutlineLocationMarker className="w-5 h-5 mr-2" />
                {lawyerContact.office}
              </p>
              <div className="flex space-x-2 mt-4">
                <button className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600">
                  Message
                </button>
                <button className="flex-1 border border-primary-500 text-primary-500 py-2 rounded-lg hover:bg-primary-50">
                  Call
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          {/* Case Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Case Status</h2>
              <HiOutlineScale className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Case Number</p>
                <p className="font-medium">{caseStatus.caseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-medium text-green-500">{caseStatus.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next Hearing</p>
                <p className="font-medium">{caseStatus.nextHearing}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Assigned Lawyer</p>
                <p className="font-medium">{caseStatus.assignedLawyer}</p>
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Important Dates</h2>
              <HiOutlineCalendar className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-4">
              {importantDates.map((item, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <p className="font-medium">{item.event}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.date}
                  </p>
                  {item.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <HiOutlineLocationMarker className="w-4 h-4 mr-1" />
                      {item.location}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <HiOutlineBell className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-lg ${
                    notification.type === 'urgent' 
                      ? 'bg-red-50 dark:bg-red-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start">
                    {notification.type === 'urgent' ? (
                      <HiOutlineExclamation className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    ) : (
                      <HiOutlineInformationCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Recent Documents</h2>
              <HiOutlineDocumentDuplicate className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <HiOutlineDocumentText className="w-5 h-5 text-primary-500 mr-3" />
                  <div>
                    <p className="font-medium">Case Summary</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Added 2 days ago
                    </p>
                  </div>
                </div>
                <button className="text-primary-500 hover:text-primary-600">
                  View
                </button>
              </div>
              {/* Add more documents */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
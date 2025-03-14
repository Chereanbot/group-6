import React from 'react';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineClipboardCheck,
  HiOutlineBell,
  HiOutlineExclamation,
} from 'react-icons/hi';

export const AppointmentManagementGuide = () => {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <HiOutlineCalendar className="w-6 h-6 mr-2 text-indigo-500" />
          Appointment Management Guide
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Effective appointment management is crucial for maintaining smooth operations
          and ensuring quality service to clients. This guide covers all aspects of
          scheduling and managing appointments.
        </p>
      </section>

      <section>
        <h4 className="font-medium mb-3">Appointment Types:</h4>
        <div className="grid gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineUserGroup className="w-5 h-5 mr-2 text-indigo-500" />
              Initial Consultations
            </h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>First meeting with new clients</li>
              <li>Case assessment and evaluation</li>
              <li>Document collection and verification</li>
              <li>Legal aid eligibility check</li>
              <li>Basic legal advice and guidance</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineClipboardCheck className="w-5 h-5 mr-2 text-indigo-500" />
              Case Review Meetings
            </h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Progress updates and discussions</li>
              <li>Strategy planning sessions</li>
              <li>Document review meetings</li>
              <li>Case status updates</li>
              <li>Next steps planning</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineClock className="w-5 h-5 mr-2 text-indigo-500" />
              Follow-up Appointments
            </h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Additional document submission</li>
              <li>Case updates and clarifications</li>
              <li>Legal advice sessions</li>
              <li>Preparation for court appearances</li>
              <li>Resolution discussions</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Scheduling Process:</h4>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">1. Pre-scheduling</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Check lawyer availability</li>
              <li>Verify client availability</li>
              <li>Determine appointment duration</li>
              <li>Check for scheduling conflicts</li>
              <li>Prepare necessary documents</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">2. Scheduling</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Select appropriate time slot</li>
              <li>Book meeting room if required</li>
              <li>Record appointment details</li>
              <li>Send confirmations to all parties</li>
              <li>Set up reminders</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">3. Follow-up</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Send appointment reminders</li>
              <li>Confirm attendance</li>
              <li>Handle rescheduling requests</li>
              <li>Update calendar accordingly</li>
              <li>Document any changes</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Handling Special Cases:</h4>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h5 className="font-medium mb-2 flex items-center">
            <HiOutlineExclamation className="w-5 h-5 mr-2 text-indigo-500" />
            Urgent Appointments
          </h5>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Identify urgent cases requiring immediate attention</li>
            <li>Follow expedited scheduling procedures</li>
            <li>Coordinate with available lawyers</li>
            <li>Arrange emergency consultations if needed</li>
            <li>Document urgency reasons and actions taken</li>
          </ul>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Notifications:</h4>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h5 className="font-medium mb-2 flex items-center">
            <HiOutlineBell className="w-5 h-5 mr-2 text-indigo-500" />
            Reminder System
          </h5>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Set up automated reminders</li>
            <li>Send confirmation emails/SMS</li>
            <li>Track notification delivery</li>
            <li>Handle bounce-backs and failures</li>
            <li>Maintain communication logs</li>
          </ul>
        </div>
      </section>

      <section className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-indigo-700 dark:text-indigo-300">Best Practices:</h4>
        <ul className="list-disc pl-5 space-y-2 text-indigo-600 dark:text-indigo-300">
          <li>Maintain up-to-date calendar</li>
          <li>Double-check scheduling conflicts</li>
          <li>Send timely reminders</li>
          <li>Keep detailed appointment notes</li>
          <li>Follow up on missed appointments</li>
          <li>Regular calendar review and cleanup</li>
          <li>Document all communication attempts</li>
        </ul>
      </section>

      <section className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-yellow-700 dark:text-yellow-300">Important Notes:</h4>
        <ul className="list-disc pl-5 space-y-2 text-yellow-600 dark:text-yellow-300">
          <li>Always verify contact information before scheduling</li>
          <li>Consider travel time between appointments</li>
          <li>Keep buffer time for unexpected delays</li>
          <li>Have backup plans for cancellations</li>
          <li>Maintain client privacy and confidentiality</li>
        </ul>
      </section>
    </div>
  );
}; 
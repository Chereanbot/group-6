import React from 'react';
import {
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineChartBar,
} from 'react-icons/hi';

export const GettingStartedGuide = () => {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <HiOutlineUserGroup className="w-6 h-6 mr-2 text-indigo-500" />
          Welcome to the Legal Aid Coordinator Dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          As a coordinator, you play a crucial role in managing cases, clients, and office operations.
          This guide will help you understand the key features and responsibilities of your role.
        </p>
      </section>

      <section>
        <h4 className="font-medium mb-3">Key Responsibilities:</h4>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>Managing client intake and registration</li>
          <li>Coordinating case assignments with lawyers</li>
          <li>Scheduling and managing appointments</li>
          <li>Document processing and verification</li>
          <li>Monitoring case progress and deadlines</li>
          <li>Generating reports and analytics</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium mb-3">Dashboard Overview:</h4>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineClipboardList className="w-5 h-5 mr-2 text-indigo-500" />
              Quick Actions
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Access frequently used functions like adding new clients, managing office resources,
              and handling cases. These shortcuts help you perform common tasks efficiently.
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineChartBar className="w-5 h-5 mr-2 text-indigo-500" />
              Statistics Overview
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Monitor key metrics including total cases, active cases, pending documents,
              and upcoming appointments. These stats help you track office performance.
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineScale className="w-5 h-5 mr-2 text-indigo-500" />
              Case Management
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View and manage all cases, track their status, and ensure proper assignment
              to lawyers. The system helps you maintain organized case records.
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineCalendar className="w-5 h-5 mr-2 text-indigo-500" />
              Appointment Management
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Schedule and track appointments between clients and lawyers. The calendar
              system helps prevent conflicts and manage time effectively.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Getting Help:</h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you need assistance, you can:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>Use the Help Center (click the ? icon)</li>
          <li>Contact technical support at cherinetafework@gmail.com</li>
          <li>Call our support hotline: +251947006369</li>
          <li>Access training resources and documentation</li>
        </ul>
      </section>

      <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-blue-700 dark:text-blue-300">Pro Tips:</h4>
        <ul className="list-disc pl-5 space-y-2 text-blue-600 dark:text-blue-300">
          <li>Use keyboard shortcuts for faster navigation</li>
          <li>Customize your dashboard layout for optimal workflow</li>
          <li>Set up notification preferences for important updates</li>
          <li>Regularly check the pending documents section</li>
          <li>Keep client information up to date</li>
        </ul>
      </section>
    </div>
  );
}; 
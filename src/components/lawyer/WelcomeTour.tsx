'use client'

import { useState, useEffect, useCallback } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from 'next-themes';
import '@/styles/tour.css';

const steps = [
  {
    selector: '[data-tour="welcome"]',
    content: () => (
      <div key="welcome" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Welcome to Your Legal Dashboard!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Let's take a quick tour to help you get started with managing your legal practice.
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="cases"]',
    content: () => (
      <div key="cases" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Case Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Track and manage all your legal cases in one place. Monitor deadlines, documents, and case progress.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="cases-1">View case details and history</li>
          <li key="cases-2">Track deadlines and appointments</li>
          <li key="cases-3">Manage case documents</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="calendar"]',
    content: () => (
      <div key="calendar" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Calendar & Scheduling</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Keep track of all your important dates, court appearances, and client meetings.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="calendar-1">Schedule appointments</li>
          <li key="calendar-2">Set reminders</li>
          <li key="calendar-3">Manage court dates</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="documents"]',
    content: () => (
      <div key="documents" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Document Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Access and manage all your legal documents and templates efficiently.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="documents-1">Upload and organize documents</li>
          <li key="documents-2">Use document templates</li>
          <li key="documents-3">Share files securely</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="communications"]',
    content: () => (
      <div key="communications" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Client Communications</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Stay connected with your clients through secure messaging and updates.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="communications-1">Send secure messages</li>
          <li key="communications-2">Schedule appointments</li>
          <li key="communications-3">Share case updates</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="time-tracking"]',
    content: () => (
      <div key="time-tracking" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Time & Billing</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Track your billable hours and manage invoices efficiently.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="time-tracking-1">Track billable hours</li>
          <li key="time-tracking-2">Generate invoices</li>
          <li key="time-tracking-3">Monitor payments</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="research"]',
    content: () => (
      <div key="research" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Legal Research</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Access comprehensive legal research tools and resources.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="research-1">Search case law</li>
          <li key="research-2">Access legal databases</li>
          <li key="research-3">Save research materials</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="compliance"]',
    content: () => (
      <div key="compliance" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Compliance & Ethics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Stay compliant with legal requirements and ethical guidelines.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="compliance-1">Track compliance requirements</li>
          <li key="compliance-2">Monitor ethical guidelines</li>
          <li key="compliance-3">Generate compliance reports</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="header-search"]',
    content: () => (
      <div key="header-search" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Quick Search</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Quickly find cases, documents, and other resources using the global search.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="header-search-1">Search across all content</li>
          <li key="header-search-2">Use filters to refine results</li>
          <li key="header-search-3">Access recent searches</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="header-notifications"]',
    content: () => (
      <div key="header-notifications" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Stay updated with important alerts and notifications.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="header-notifications-1">Case updates and deadlines</li>
          <li key="header-notifications-2">New messages and appointments</li>
          <li key="header-notifications-3">System notifications</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="header-messages"]',
    content: () => (
      <div key="header-messages" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Quick Messages</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Access your messages and chat with clients directly.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="header-messages-1">View recent messages</li>
          <li key="header-messages-2">Start new conversations</li>
          <li key="header-messages-3">Access chat history</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="header-theme"]',
    content: () => (
      <div key="header-theme" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Theme Switcher</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Customize your viewing experience with light and dark modes.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="header-theme-1">Toggle between light and dark themes</li>
          <li key="header-theme-2">Automatically matches system preferences</li>
          <li key="header-theme-3">Reduces eye strain in low light</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="header-profile"]',
    content: () => (
      <div key="header-profile" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Profile & Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Access your profile, settings, and account options.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="header-profile-1">Update profile information</li>
          <li key="header-profile-2">Manage account settings</li>
          <li key="header-profile-3">Sign out securely</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="dashboard-stats"]',
    content: () => (
      <div key="dashboard-stats" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Quick Statistics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Get an overview of your practice with key metrics and statistics.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="dashboard-stats-1">Active cases and deadlines</li>
          <li key="dashboard-stats-2">Performance metrics</li>
          <li key="dashboard-stats-3">Upcoming appointments</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="dashboard-activities"]',
    content: () => (
      <div key="dashboard-activities" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Recent Activities</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Track all recent actions and updates across your cases.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="dashboard-activities-1">Case updates and changes</li>
          <li key="dashboard-activities-2">Document activities</li>
          <li key="dashboard-activities-3">Client interactions</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="dashboard-calendar"]',
    content: () => (
      <div key="dashboard-calendar" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Calendar Overview</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          View and manage your upcoming schedule.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="dashboard-calendar-1">Court appearances</li>
          <li key="dashboard-calendar-2">Client meetings</li>
          <li key="dashboard-calendar-3">Important deadlines</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="dashboard-cases"]',
    content: () => (
      <div key="dashboard-cases" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Active Cases</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Monitor your current caseload and priorities.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="dashboard-cases-1">Case status updates</li>
          <li key="dashboard-cases-2">Priority indicators</li>
          <li key="dashboard-cases-3">Quick case access</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="dashboard-performance"]',
    content: () => (
      <div key="dashboard-performance" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Track your productivity and efficiency metrics.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="dashboard-performance-1">Billable hours</li>
          <li key="dashboard-performance-2">Case resolution rates</li>
          <li key="dashboard-performance-3">Client satisfaction</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="dashboard-documents"]',
    content: () => (
      <div key="dashboard-documents" className="p-4">
        <h3 className="text-lg font-semibold mb-2">Recent Documents</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Quick access to your recently accessed documents.
        </p>
        <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
          <li key="dashboard-documents-1">Latest uploads</li>
          <li key="dashboard-documents-2">Modified documents</li>
          <li key="dashboard-documents-3">Shared files</li>
        </ul>
      </div>
    ),
  }
];

function TourContent() {
  const tour = useTour();
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenLawyerTour', false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSeenTour && tour.setIsOpen) {
        tour.setIsOpen(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasSeenTour, tour.setIsOpen]);

  useEffect(() => {
    const startTour = () => {
      if (tour.setIsOpen) {
        tour.setIsOpen(true);
      }
    };

    window.addEventListener('startTour', startTour);
    return () => window.removeEventListener('startTour', startTour);
  }, [tour.setIsOpen]);

  return null;
}

interface WelcomeTourProps {
  onClose?: () => void;
  locale?: 'en' | 'am';
}

export function WelcomeTour({ onClose, locale = 'en' }: WelcomeTourProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isReady, setIsReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour] = useLocalStorage('hasSeenLawyerTour', false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
    window.dispatchEvent(new CustomEvent('tourStep', { detail: { step } }));
  }, []);

  if (!isReady || hasSeenTour) return null;

  return (
    <TourProvider
      steps={steps}
      currentStep={currentStep}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: isDark 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.24)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          color: isDark ? '#e5e7eb' : '#111827'
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: isDark ? '#374151' : '#e5e7eb',
          color: isDark ? '#e5e7eb' : '#111827'
        }),
        controls: (base) => ({
          ...base,
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
        }),
        button: (base) => ({
          ...base,
          backgroundColor: '#2563eb',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1d4ed8'
          }
        }),
        close: (base) => ({
          ...base,
          color: isDark ? '#e5e7eb' : '#111827',
          '&:hover': {
            color: isDark ? '#ffffff' : '#000000'
          }
        }),
      }}
      showNavigation={true}
      showBadge={true}
      showDots={true}
      showCloseButton={true}
      disableInteraction={false}
      padding={{ mask: 8 }}
      afterOpen={() => handleStepChange(0)}
      beforeClose={() => {
        document.dispatchEvent(new Event('tourEnd'));
      }}
      onClickMask={() => {
        // Do nothing to prevent closing on mask click
      }}
      setCurrentStep={handleStepChange}
    >
      <TourContent />
    </TourProvider>
  );
}
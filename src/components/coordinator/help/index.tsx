import React from 'react';
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineX,
  HiOutlineAcademicCap,
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineFolder,
  HiOutlineClock,
} from 'react-icons/hi';
import { GettingStartedGuide } from './GettingStartedGuide';
import { CaseManagementGuide } from './CaseManagementGuide';
import { DocumentHandlingGuide } from './DocumentHandlingGuide';
import { AppointmentManagementGuide } from './AppointmentManagementGuide';

interface HelpCenterProps {
  onClose: () => void;
  selectedGuide: string | null;
  setSelectedGuide: (guide: string | null) => void;
}

export const HelpCenter = ({ onClose, selectedGuide, setSelectedGuide }: HelpCenterProps) => {
  const renderGuideContent = () => {
    switch (selectedGuide) {
      case 'getting-started':
        return <GettingStartedGuide />;
      case 'case-management':
        return <CaseManagementGuide />;
      case 'document-handling':
        return <DocumentHandlingGuide />;
      case 'appointments':
        return <AppointmentManagementGuide />;
      default:
        return null;
    }
  };

  const helpGuides = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of the coordinator dashboard',
      icon: HiOutlineAcademicCap,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      id: 'case-management',
      title: 'Case Management',
      description: 'Learn how to manage cases effectively',
      icon: HiOutlineScale,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
    {
      id: 'document-handling',
      title: 'Document Handling',
      description: 'Guide to document processing and management',
      icon: HiOutlineDocumentText,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      id: 'appointments',
      title: 'Appointment Management',
      description: 'Learn about scheduling and managing appointments',
      icon: HiOutlineCalendar,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  const selectedGuideData = selectedGuide ? helpGuides.find(g => g.id === selectedGuide) : null;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
          {selectedGuideData ? (
            <>
              <div className={`p-2 rounded-lg ${selectedGuideData.bgColor} mr-3`}>
                <selectedGuideData.icon className={`w-6 h-6 ${selectedGuideData.iconColor}`} />
              </div>
              {selectedGuideData.title}
            </>
          ) : (
            <>
              <HiOutlineBookOpen className="w-6 h-6 mr-2 text-blue-500" />
              Help Center
            </>
          )}
        </h2>
        <button
          onClick={selectedGuide ? () => setSelectedGuide(null) : onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <HiOutlineX className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedGuide ? (
          <div className="p-6">
            {renderGuideContent()}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4">
              {helpGuides.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide.id)}
                  className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${guide.bgColor}`}>
                      <guide.icon className={`w-8 h-8 ${guide.iconColor}`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">{guide.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
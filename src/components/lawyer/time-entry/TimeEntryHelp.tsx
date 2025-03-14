'use client';

import { useState } from 'react';
import { HelpCircle, X, Clock, Users, BarChart2, Scale } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function TimeEntryHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const helpSections = {
    overview: {
      title: 'Time Entry Overview',
      icon: <Clock className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>Time tracking helps legal aid lawyers:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Monitor case progress effectively</li>
            <li>Ensure fair distribution of aid services</li>
            <li>Track assistance provided to beneficiaries</li>
            <li>Measure impact of legal aid services</li>
          </ul>
          <p className="text-sm text-gray-600">
            Accurate time tracking helps ensure quality legal services for all beneficiaries
            and helps identify areas where additional support may be needed.
          </p>
        </div>
      ),
    },
    beneficiaries: {
      title: 'Beneficiary Service',
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>Best practices for serving beneficiaries:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Document all interactions and consultations</li>
            <li>Track time spent on each beneficiary's case</li>
            <li>Record types of legal assistance provided</li>
            <li>Note any special needs or considerations</li>
          </ul>
          <p className="text-sm text-gray-600">
            Detailed documentation helps ensure comprehensive support for each beneficiary.
          </p>
        </div>
      ),
    },
    tracking: {
      title: 'Time Tracking Tips',
      icon: <BarChart2 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>Effective time tracking for legal aid:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Record time entries promptly after activities</li>
            <li>Categorize activities by type of legal service</li>
            <li>Monitor time allocation across different cases</li>
            <li>Track community outreach and education time</li>
          </ul>
          <p className="text-sm text-gray-600">
            Good time tracking helps optimize legal aid service delivery and resource allocation.
          </p>
        </div>
      ),
    },
    compliance: {
      title: 'Legal Aid Standards',
      icon: <Scale className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>Important considerations for legal aid services:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Maintain records as per university guidelines</li>
            <li>Document eligibility assessments</li>
            <li>Track case outcomes and resolutions</li>
            <li>Record referrals to other support services</li>
          </ul>
          <p className="text-sm text-gray-600">
            Proper documentation ensures accountability and helps improve legal aid services.
          </p>
        </div>
      ),
    },
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg bg-white"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-6 w-6 text-blue-600" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Legal Aid Time Management Guide</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Learn how to effectively track and manage time for legal aid services
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 gap-6 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r pr-6 space-y-2">
              {Object.entries(helpSections).map(([key, section]) => (
                <Button
                  key={key}
                  variant={activeSection === key ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveSection(key)}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </Button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {helpSections[activeSection as keyof typeof helpSections].icon}
                  {helpSections[activeSection as keyof typeof helpSections].title}
                </h3>
                {helpSections[activeSection as keyof typeof helpSections].content}

                {activeSection === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Quick Start Guide</h4>
                      <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>Select the beneficiary's case</li>
                        <li>Enter activity start and end times</li>
                        <li>Add detailed description of assistance provided</li>
                        <li>Record any follow-up actions needed</li>
                        <li>Save the time entry</li>
                      </ol>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Benefits</h4>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>Better service to beneficiaries</li>
                        <li>Improved case management</li>
                        <li>Enhanced resource allocation</li>
                        <li>Better outcome tracking</li>
                      </ul>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
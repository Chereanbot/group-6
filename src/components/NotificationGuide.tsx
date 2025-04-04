import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HiOutlineBell,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineX,
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideStep {
  title: string;
  description: string;
  icon: JSX.Element;
  example?: JSX.Element;
}

export default function NotificationGuide({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps: GuideStep[] = [
    {
      title: "Welcome to Notifications",
      description: "This guide will help you understand how to use the notification system effectively. Click 'Next' to begin.",
      icon: <HiOutlineBell className="h-8 w-8 text-primary" />,
    },
    {
      title: "Notification Types",
      description: "You can view both notifications and SMS messages. Switch between them using the tabs at the top.",
      icon: <HiOutlineMail className="h-8 w-8 text-primary" />,
      example: (
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">
            <HiOutlineMail className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <HiOutlinePhone className="mr-2 h-4 w-4" />
            SMS
          </Button>
        </div>
      ),
    },
    {
      title: "Search and Filters",
      description: "Use the search bar to find specific messages. Filter by status or date to narrow down your results.",
      icon: <HiOutlineSearch className="h-8 w-8 text-primary" />,
      example: (
        <div className="flex items-center gap-2 mt-4">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input className="pl-10 pr-4 py-2 border rounded-md" placeholder="Search messages..." />
          </div>
          <Button variant="outline" size="sm">
            <HiOutlineFilter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      ),
    },
    {
      title: "Message Status",
      description: "Messages can be unread, read, pending, sent, or failed. Each status is color-coded for easy identification.",
      icon: <HiOutlineCheck className="h-8 w-8 text-primary" />,
      example: (
        <div className="flex gap-2 mt-4">
          <Badge variant="default">UNREAD</Badge>
          <Badge variant="secondary">READ</Badge>
          <Badge variant="default">PENDING</Badge>
          <Badge variant="secondary">SENT</Badge>
          <Badge variant="destructive">FAILED</Badge>
        </div>
      ),
    },
    {
      title: "Actions",
      description: "You can mark notifications as read and resend both notifications and SMS messages when needed.",
      icon: <HiOutlineRefresh className="h-8 w-8 text-primary" />,
      example: (
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">
            <HiOutlineCheck className="mr-2 h-4 w-4" />
            Mark as read
          </Button>
          <Button variant="outline" size="sm">
            <HiOutlineRefresh className="mr-2 h-4 w-4" />
            Resend
          </Button>
        </div>
      ),
    },
    {
      title: "Appointment Information",
      description: "Notifications related to appointments show additional details like time until appointment and purpose.",
      icon: <HiOutlineCalendar className="h-8 w-8 text-primary" />,
      example: (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="font-medium">Appointment Reminder</div>
          <div className="text-sm text-gray-500">Your appointment is scheduled.</div>
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
            <HiOutlineCalendar className="h-4 w-4" />
            <span>Appointment in 24 hours</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <Card>
          <CardHeader className="relative border-b">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              <HiOutlineX className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl flex items-center gap-3">
              {guideSteps[currentStep].icon}
              {guideSteps[currentStep].title}
            </CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {guideSteps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                {guideSteps[currentStep].description}
              </p>
              {guideSteps[currentStep].example}
            </div>
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(current => current - 1)}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {guideSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              {currentStep < guideSteps.length - 1 ? (
                <Button onClick={() => setCurrentStep(current => current + 1)}>
                  Next
                  <HiOutlineArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={onClose}>Finish</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 
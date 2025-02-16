'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TourStep {
  title: string;
  completed: boolean;
}

export function TourProgress() {
  const [steps, setSteps] = useState<TourStep[]>([
    { title: 'Dashboard Overview', completed: false },
    { title: 'Case Management', completed: false },
    { title: 'Calendar & Schedule', completed: false },
    { title: 'Document Management', completed: false },
    { title: 'Client Communications', completed: false },
    { title: 'Time Tracking', completed: false },
    { title: 'Settings & Profile', completed: false },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleTourStep = (event: CustomEvent) => {
      const stepIndex = event.detail.step;
      setCurrentStep(stepIndex);
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        completed: idx < stepIndex
      })));
    };

    window.addEventListener('tourStep' as any, handleTourStep);
    return () => window.removeEventListener('tourStep' as any, handleTourStep);
  }, []);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className={`fixed right-0 top-20 w-64 p-4 rounded-l-lg shadow-lg ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">Tour Progress</h3>
      </div>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`flex items-center gap-2 p-2 rounded ${
              currentStep === index
                ? 'bg-blue-50 dark:bg-blue-900/50'
                : ''
            }`}
          >
            {step.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <div className={`w-4 h-4 rounded-full border-2 ${
                currentStep === index
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`} />
            )}
            <span className={`text-sm ${
              currentStep === index
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : step.completed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
            }`}>
              {step.title}
            </span>
            {currentStep === index && (
              <ChevronRight className="w-4 h-4 text-blue-500 ml-auto" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {currentStep + 1} of {steps.length} steps completed
      </div>
    </motion.div>
  );
} 
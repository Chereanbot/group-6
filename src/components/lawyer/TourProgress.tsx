'use client'

import { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, ChevronRight, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type TourStep = {
  title: string;
  completed: boolean;
  description?: string;
};

export function TourProgress() {
  const [steps, setSteps] = useState<TourStep[]>([
    { 
      title: 'Dashboard Overview', 
      completed: false,
      description: 'Get familiar with your lawyer dashboard' 
    },
    { 
      title: 'Case Management', 
      completed: false,
      description: 'Learn how to manage your legal cases' 
    },
    { 
      title: 'Calendar & Schedule', 
      completed: false,
      description: 'Track appointments and court dates' 
    },
    { 
      title: 'Document Management', 
      completed: false,
      description: 'Organize and access case documents' 
    },
    { 
      title: 'Client Communications', 
      completed: false,
      description: 'Communicate securely with clients' 
    },
    { 
      title: 'Time Tracking', 
      completed: false,
      description: 'Track billable hours and activities' 
    },
    { 
      title: 'Settings & Profile', 
      completed: false,
      description: 'Customize your experience' 
    },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleTourStep = (event: CustomEvent) => {
      const stepIndex = event.detail.step;
      
      // Animate the progress update
      setCurrentStep(stepIndex);
      
      // Update completed steps with a slight delay for visual effect
      setTimeout(() => {
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          completed: idx < stepIndex
        })));
      }, 300);
      
      // Show confetti effect when completing a step
      if (stepIndex > 0) {
        showConfetti();
      }
    };
    
    // Function to show confetti effect
    const showConfetti = () => {
      const confettiContainer = document.getElementById('confetti-container');
      if (confettiContainer) {
        confettiContainer.classList.add('show-confetti');
        setTimeout(() => {
          confettiContainer.classList.remove('show-confetti');
        }, 2000);
      }
    };

    window.addEventListener('tourStep' as any, handleTourStep);
    return () => window.removeEventListener('tourStep' as any, handleTourStep);
  }, []);
  
  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className={cn(
          "fixed right-0 top-20 w-72 rounded-l-xl shadow-xl overflow-hidden z-50",
          "border-l-4 border-t border-b",
          isDark 
            ? "bg-gray-800 text-white border-[#1f9345]" 
            : "bg-white text-gray-800 border-[#00572d]"
        )}
      >
        {/* Progress bar at the top */}
        <div className="relative h-1 bg-gray-200 dark:bg-gray-700">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00572d] to-[#1f9345]"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="relative">
              <HelpCircle className="w-5 h-5 text-[#00572d] dark:text-[#1f9345]" />
              <motion.div 
                className="absolute inset-0 bg-[#f3c300]/20 rounded-full blur-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <h3 className="font-semibold">Tour Progress</h3>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Steps list */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                currentStep === index
                  ? "bg-[#00572d]/10 dark:bg-[#1f9345]/20 border border-[#f3c300]/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
              )}
            >
              <div className="mt-0.5">
                {step.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#1f9345]" />
                  </motion.div>
                ) : currentStep === index ? (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-[#f3c300] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#f3c300]"></div>
                    </div>
                  </motion.div>
                ) : (
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2",
                    "border-gray-300 dark:border-gray-500"
                  )} />
                )}
              </div>
              
              <div className="flex-1">
                <span className={cn(
                  "text-sm font-medium block",
                  currentStep === index
                    ? "text-[#00572d] dark:text-[#1f9345]"
                    : step.completed
                      ? "text-[#1f9345] dark:text-[#1f9345]/80"
                      : "text-gray-600 dark:text-gray-400"
                )}>
                  {step.title}
                </span>
                
                {(currentStep === index || step.completed) && step.description && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs mt-1 text-gray-500 dark:text-gray-400"
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>
              
              {currentStep === index && (
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="w-4 h-4 text-[#f3c300]" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-[#00572d] dark:text-[#1f9345]">{currentStep + 1}</span> of {steps.length} steps
            </div>
            
            {/* Progress percentage */}
            <div className="text-xs font-medium text-[#00572d] dark:text-[#1f9345]">
              {Math.round((currentStep / (steps.length - 1)) * 100)}%
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00572d] to-[#1f9345] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Completion message */}
          {currentStep === steps.length - 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-[#1f9345] font-medium"
            >
              <Award className="w-4 h-4 text-[#f3c300]" />
              <span>Almost complete! Finish the tour to earn your badge.</span>
            </motion.div>
          )}
        </div>
        
        {/* Confetti container */}
        <div id="confetti-container" className="confetti-container"></div>
        
        {/* Add the CSS for confetti animation */}
        <style jsx global>{`
          .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .show-confetti {
            opacity: 1;
          }
          
          .show-confetti::before,
          .show-confetti::after {
            content: '';
            position: absolute;
            width: 10px;
            height: 10px;
            background: #f3c300;
            border-radius: 50%;
            animation: confetti-fall 2s ease-out forwards;
            opacity: 0.8;
          }
          
          .show-confetti::before {
            left: 30%;
            animation-delay: 0.1s;
          }
          
          .show-confetti::after {
            left: 70%;
            animation-delay: 0.3s;
          }
          
          @keyframes confetti-fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
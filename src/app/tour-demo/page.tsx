'use client'

import { useState, useEffect } from 'react'
import { PersistentTourButton } from '@/components/lawyer/PersistentTourButton'
import { FloatingTourButton } from '@/components/lawyer/FloatingTourButton'
import { TourProgress } from '@/components/lawyer/TourProgress'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function TourDemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTourProgress, setShowTourProgress] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Maximum number of steps in the tour
  const maxSteps = 7
  
  // Function to dispatch tour step event
  const dispatchTourStep = (step: number) => {
    const event = new CustomEvent('tourStep', { detail: { step } })
    window.dispatchEvent(event)
  }
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep < maxSteps - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      dispatchTourStep(nextStep)
    }
  }
  
  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      dispatchTourStep(prevStep)
    }
  }
  
  // Start the tour
  const startTour = () => {
    setShowTourProgress(true)
    setCurrentStep(0)
    dispatchTourStep(0)
  }
  
  // Listen for startTour event
  useEffect(() => {
    const handleStartTour = () => {
      startTour()
    }
    
    window.addEventListener('startTour', handleStartTour)
    return () => window.removeEventListener('startTour', handleStartTour)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#00572d] dark:text-[#1f9345]">
              DULAS Tour Components Demo
            </h1>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
              
              <div className="flex items-center gap-2">
                <button 
                  className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-[#00572d] text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setTheme('light')}
                >
                  English
                </button>
                <button 
                  className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-[#00572d] text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setTheme('dark')}
                >
                  አማርኛ
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            This page demonstrates the enhanced tour components with the DULAS color scheme.
            The components include PersistentTourButton, FloatingTourButton, and TourProgress.
          </p>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#00572d] dark:text-[#1f9345] mb-4">
              Tour Navigation Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Use these buttons to navigate through the tour steps and see how the TourProgress component updates.
            </p>
            
            <div className="flex items-center gap-4 mt-6">
              <Button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </Button>
              
              <div className="text-sm font-medium">
                Step {currentStep + 1} of {maxSteps}
              </div>
              
              <Button
                onClick={handleNextStep}
                disabled={currentStep === maxSteps - 1}
                className="bg-[#00572d] hover:bg-[#1f9345] text-white flex items-center gap-2"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={startTour}
                variant="outline"
                className="ml-4 border-[#f3c300] text-[#00572d] hover:bg-[#f3c300]/10"
              >
                Restart Tour
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#00572d] dark:text-[#1f9345] mb-4">
                Tour Button Components
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                These buttons trigger the tour to start. The PersistentTourButton stays fixed at the bottom right,
                while the FloatingTourButton appears with animation.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-8 relative h-40">
                <div className="relative w-full h-20">
                  {/* This is just a placeholder to show where the buttons would appear */}
                  <div className="absolute bottom-0 right-0 text-xs text-gray-500">
                    ↓ PersistentTourButton appears here
                  </div>
                  <div className="absolute bottom-20 right-0 text-xs text-gray-500">
                    ↓ FloatingTourButton appears here
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#00572d] dark:text-[#1f9345] mb-4">
                Tour Progress Component
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The TourProgress component shows the current step in the tour and progress through all steps.
                It appears when the tour starts and can be closed with the X button.
              </p>
              <div className="mt-8 flex items-center justify-center">
                <Button
                  onClick={() => setShowTourProgress(!showTourProgress)}
                  className="bg-[#00572d] hover:bg-[#1f9345] text-white"
                >
                  {showTourProgress ? 'Hide' : 'Show'} Tour Progress
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#00572d] dark:text-[#1f9345] mb-4">
            DULAS Color Scheme
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <div className="h-24 bg-[#00572d] rounded-t-lg flex items-center justify-center text-white font-medium">
                Primary Green
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 text-center text-sm rounded-b-lg">
                #00572d
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="h-24 bg-[#1f9345] rounded-t-lg flex items-center justify-center text-white font-medium">
                Secondary Green
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 text-center text-sm rounded-b-lg">
                #1f9345
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="h-24 bg-[#f3c300] rounded-t-lg flex items-center justify-center text-black font-medium">
                Accent Yellow-Gold
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 text-center text-sm rounded-b-lg">
                #f3c300
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* The actual tour components */}
      <PersistentTourButton />
      <FloatingTourButton />
      {showTourProgress && <TourProgress />}
    </div>
  )
}

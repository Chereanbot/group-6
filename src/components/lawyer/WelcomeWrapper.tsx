'use client'

import { useState, useEffect } from 'react';
import { WelcomeModal } from './WelcomeModal';
import { WelcomeTour } from './WelcomeTour';
import { PersistentTourButton } from './PersistentTourButton';
import { TourProgress } from './TourProgress';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';

// Language translations for the tour components
const translations = {
  en: {
    welcomeTitle: 'Welcome to DULAS',
    welcomeMessage: 'Get started with a quick tour of the system',
    startTour: 'Start Tour',
    skipTour: 'Skip Tour',
    continueTour: 'Continue Tour',
    closeTour: 'Close Tour',
    language: 'Language',
    english: 'English',
    amharic: 'አማርኛ',
  },
  am: {
    welcomeTitle: 'እንኳን ወደ DULAS በደህና መጡ',
    welcomeMessage: 'የስርዓቱን ፈጣን ጉብኝት ይጀምሩ',
    startTour: 'ጉብኝት ጀምር',
    skipTour: 'ጉብኝት ዝለል',
    continueTour: 'ጉብኝት ቀጥል',
    closeTour: 'ጉብኝት ዝጋ',
    language: 'ቋንቋ',
    english: 'English',
    amharic: 'አማርኛ',
  }
};

interface Props {
  lawyerName: string;
  children?: React.ReactNode;
}

export function WelcomeWrapper({ lawyerName, children }: Props) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showTourProgress, setShowTourProgress] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [locale, setLocale] = useState<'en' | 'am'>('en');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Get translations based on current locale
  const t = translations[locale];

  useEffect(() => {
    // Check if this is the user's first visit
    const isFirstVisit = localStorage.getItem('lawyerFirstVisit') !== 'false';
    
    // Get saved language preference or default to English
    const savedLocale = localStorage.getItem('preferredLanguage') as 'en' | 'am' || 'en';
    setLocale(savedLocale);
    
    if (isFirstVisit) {
      setShowWelcomeModal(true);
      localStorage.setItem('lawyerFirstVisit', 'false');
    }

    // Listen for tour start event
    const handleStartTourEvent = () => {
      setShowTour(true);
      setShowTourProgress(true);
    };

    window.addEventListener('startTour', handleStartTourEvent);
    return () => window.removeEventListener('startTour', handleStartTourEvent);
  }, []);

  // Change language handler
  const changeLanguage = (newLocale: 'en' | 'am') => {
    setLocale(newLocale);
    localStorage.setItem('preferredLanguage', newLocale);
    // Refresh the page to apply language changes across all components
    // router.refresh();
  };

  const handleStartTour = () => {
    setShowWelcomeModal(false);
    setShowTour(true);
    setShowTourProgress(true);
    setHasSeenWelcome(true);
  };

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    setHasSeenWelcome(true);
  };

  const handleCloseTour = () => {
    setShowTour(false);
    setShowTourProgress(false);
    setHasSeenTour(true);
  };

  const toggleLanguageSelector = () => {
    setShowLanguageSelector(!showLanguageSelector);
  };

  return (
    <>
      {children}
      
      {/* Welcome Modal with language support */}
      {showWelcomeModal && (
        <WelcomeModal
          lawyerName={lawyerName}
          onStartTour={handleStartTour}
          onClose={handleCloseModal}
          locale={locale}
        />
      )}
      
      {/* Tour components */}
      {showTour && <WelcomeTour onClose={handleCloseTour} locale={locale} />}
      <PersistentTourButton />
      {showTourProgress && <TourProgress />}
      
      {/* Language selector floating button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button 
          onClick={toggleLanguageSelector}
          className="p-3 bg-[#00572d] hover:bg-[#1f9345] text-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
          aria-label={t.language}
        >
          <Globe className="h-5 w-5" />
        </button>
        
        {/* Language dropdown */}
        <AnimatePresence>
          {showLanguageSelector && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-14 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-40"
            >
              <div className="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400">
                {t.language}
              </div>
              <div className="p-1">
                <button 
                  onClick={() => changeLanguage('en')}
                  className="flex items-center justify-between w-full p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <span>{t.english}</span>
                  {locale === 'en' && <Check className="h-4 w-4 text-[#1f9345]" />}
                </button>
                <button 
                  onClick={() => changeLanguage('am')}
                  className="flex items-center justify-between w-full p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <span>{t.amharic}</span>
                  {locale === 'am' && <Check className="h-4 w-4 text-[#1f9345]" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
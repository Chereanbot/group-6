'use client'

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Briefcase, Clock, MessageSquare, FileText, Users, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import welcomeAnimation from '@/animations/welcome.json';
import { ErrorBoundary } from 'react-error-boundary';

// Language translations
const translations = {
  en: {
    welcome: 'Welcome to DULAS',
    welcomeMessage: 'Let\'s help you get started with your legal practice management system.',
    skipTour: 'Skip Tour',
    startTour: 'Start Quick Tour',
    manageCases: 'Manage Cases',
    manageCasesDesc: 'Track and organize all your legal cases',
    trackTime: 'Track Time',
    trackTimeDesc: 'Log billable hours efficiently',
    clientComm: 'Client Communication',
    clientCommDesc: 'Stay connected with your clients',
    documents: 'Documents',
    documentsDesc: 'Manage legal documents securely',
    clients: 'Client Management',
    clientsDesc: 'Organize client information',
    compliance: 'Legal Compliance',
    complianceDesc: 'Stay up-to-date with regulations',
    loading: 'Loading animation...',
    failed: 'Failed to load animation'
  },
  am: {
    welcome: 'እንኳን ወደ DULAS በደህና መጡ',
    welcomeMessage: 'የህግ ልምምድ አስተዳደር ስርዓትዎን ለመጀመር እንረዳዎታለን።',
    skipTour: 'ጉብኝት ዝለል',
    startTour: 'ፈጣን ጉብኝት ጀምር',
    manageCases: 'ጉዳዮችን ያስተዳድሩ',
    manageCasesDesc: 'ሁሉንም የህግ ጉዳዮችዎን ይከታተሉ እና ያደራጁ',
    trackTime: 'ሰዓት ይከታተሉ',
    trackTimeDesc: 'ሊከፈልባቸው የሚችሉ ሰዓታትን በቀላሉ ይመዝግቡ',
    clientComm: 'ከደንበኞች ጋር መገናኛ',
    clientCommDesc: 'ከደንበኞችዎ ጋር ይገናኙ',
    documents: 'ሰነዶች',
    documentsDesc: 'የህግ ሰነዶችን በደህንነት ያስተዳድሩ',
    clients: 'የደንበኞች አስተዳደር',
    clientsDesc: 'የደንበኞችን መረጃ ያደራጁ',
    compliance: 'የህግ ተገዥነት',
    complianceDesc: 'ከህጎች ጋር ወቅታዊ ይሁኑ',
    loading: 'Loading animation...',
    failed: 'Failed to load animation'
  }
};

const Lottie = dynamic(() => import('react-lottie-player'), { 
  ssr: false,
  loading: () => (
    <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Loading animation...
      </div>
    </div>
  )
});

function FallbackComponent({ locale = 'en' }: { locale?: 'en' | 'am' }) {
  return (
    <div className="w-64 h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {translations[locale].failed}
      </div>
    </div>
  );
}

interface Props {
  lawyerName: string;
  onStartTour: () => void;
  onClose: () => void;
  locale?: 'en' | 'am';
}

export function WelcomeModal({ lawyerName, onStartTour, onClose, locale = 'en' }: Props) {
  // Get translations based on current locale
  const t = translations[locale];

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="text-center mb-6">
              <div className="w-64 h-64 mx-auto mb-4">
                <ErrorBoundary FallbackComponent={() => <FallbackComponent locale={locale} />}>
                  <Lottie
                    loop
                    animationData={welcomeAnimation}
                    play
                    style={{ width: '100%', height: '100%' }}
                    rendererSettings={{
                      preserveAspectRatio: 'xMidYMid slice',
                      progressiveLoad: true,
                    }}
                  />
                </ErrorBoundary>
              </div>
              <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-[#00572d] to-[#1f9345] bg-clip-text text-transparent">
                {t.welcome}{lawyerName ? `, ${lawyerName}` : ''}!
              </Dialog.Title>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t.welcomeMessage}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 text-center border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-[#00572d]" />
                <h3 className="font-medium text-[#00572d] dark:text-[#1f9345]">{t.manageCases}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.manageCasesDesc}</p>
              </div>
              <div className="p-4 text-center border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                <Clock className="w-8 h-8 mx-auto mb-2 text-[#00572d]" />
                <h3 className="font-medium text-[#00572d] dark:text-[#1f9345]">{t.trackTime}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.trackTimeDesc}</p>
              </div>
              <div className="p-4 text-center border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[#00572d]" />
                <h3 className="font-medium text-[#00572d] dark:text-[#1f9345]">{t.clientComm}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.clientCommDesc}</p>
              </div>
              <div className="p-4 text-center border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                <FileText className="w-8 h-8 mx-auto mb-2 text-[#00572d]" />
                <h3 className="font-medium text-[#00572d] dark:text-[#1f9345]">{t.documents}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.documentsDesc}</p>
              </div>
              <div className="p-4 text-center border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                <Users className="w-8 h-8 mx-auto mb-2 text-[#00572d]" />
                <h3 className="font-medium text-[#00572d] dark:text-[#1f9345]">{t.clients}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.clientsDesc}</p>
              </div>
              <div className="p-4 text-center border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                <Gavel className="w-8 h-8 mx-auto mb-2 text-[#00572d]" />
                <h3 className="font-medium text-[#00572d] dark:text-[#1f9345]">{t.compliance}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.complianceDesc}</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-[#00572d] text-[#00572d] hover:bg-[#00572d]/10 hover:text-[#00572d]"
              >
                {t.skipTour}
              </Button>
              <Button 
                onClick={onStartTour}
                className="bg-[#00572d] hover:bg-[#1f9345] text-white"
              >
                {t.startTour}
              </Button>
            </div>
          </motion.div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
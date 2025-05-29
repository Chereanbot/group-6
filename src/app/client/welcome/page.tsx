"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { isFirstTimeLogin, markUserVisited } from '@/utils/userSession';
import { useLanguage } from '@/providers/LanguageProvider';
import { 
  HiOutlineScale,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineLightBulb,
  HiOutlineGlobe,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineStar,
  HiOutlineLockClosed
} from 'react-icons/hi';

const WelcomeDashboard = () => {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  const serviceTypes = [
    {
      icon: <HiOutlineChatAlt2 className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'blue'
    },
    {
      icon: <HiOutlineDocumentText className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      shadowColor: 'green'
    },
    {
      icon: <HiOutlineScale className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      shadowColor: 'purple'
    },
    {
      icon: <HiOutlineClock className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      shadowColor: 'orange'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  useEffect(() => {
    const firstTimeUser = isFirstTimeLogin();
    setIsFirstVisit(firstTimeUser);
    
    document.body.classList.add('welcome-page');
    
    return () => {
      document.body.classList.remove('welcome-page');
    };
  }, []);

  const handleContinue = () => {
    markUserVisited();
    router.push('/client/service-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <HiOutlineLockClosed className="w-20 h-20 text-primary-500 animate-bounce mb-6" />
          <span className="text-2xl font-semibold text-white mb-2">Please wait...</span>
          <span className="text-md text-gray-200">Redirecting to the next step</span>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-12"
      >
        <motion.div
          variants={itemVariants}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">
            {t('welcome.title')}
          </h1>
          <p className="text-xl text-blue-200 text-center max-w-3xl mx-auto">
            {t('welcome.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <HiOutlineShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-8 text-center">
                  {t('welcome.freeCases.title')}
                </h2>
                <div className="space-y-4">
                  {t('welcome.freeCases.features').split(',').map((feature, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2 text-gray-300"
                    >
                      <HiOutlineCheck className="w-5 h-5 text-green-400" />
                      <span>{feature}</span>
                    </motion.p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <HiOutlineStar className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-8 text-center">
                  {t('welcome.premiumCases.title')}
                </h2>
                <div className="space-y-4">
                  {t('welcome.premiumCases.features').split(',').map((feature, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2 text-gray-300"
                    >
                      <HiOutlineCheck className="w-5 h-5 text-yellow-400" />
                      <span>{feature}</span>
                    </motion.p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {['consultation', 'documentation', 'representation', 'support'].map((serviceKey, index) => (
            <motion.div
              key={serviceKey}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
            >
              <div className={`p-3 bg-gradient-to-br ${serviceTypes[index].color} 
                rounded-lg w-fit mb-4`}
              >
                {serviceTypes[index].icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t(`welcome.services.${serviceKey}.title`)}
              </h3>
              <p className="text-gray-300">
                {t(`welcome.services.${serviceKey}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            {t('welcome.nextSteps.title')}
          </h2>
          <div className="space-y-4">
            {t('welcome.nextSteps.steps').split(',').map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20
                  flex items-center justify-center text-primary-400 font-bold"
                >
                  {index + 1}
                </div>
                <span className="text-gray-300">{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500
              rounded-xl text-white font-semibold text-lg overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              }}
            />
            <span className="flex items-center space-x-2">
              <span>{t('welcome.completeProfile')}</span>
              <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
      
      {isFirstVisit && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-6 right-6 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-primary-500"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <HiOutlineLightBulb className="h-10 w-10 text-primary-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Welcome to Dilla University Legal Aid!</h3>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <p>This appears to be your first visit. Complete your registration to access our legal services.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsFirstVisit(false)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WelcomeDashboard;
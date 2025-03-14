"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineGlobe,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiOutlineUserGroup
} from 'react-icons/hi';

const ServiceSelection = () => {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [selectedService, setSelectedService] = useState<'free' | 'premium' | null>(null);

  const translations = {
    en: {
      title: 'Choose Your Service Type',
      subtitle: 'Select the service that best fits your needs',
      freePlan: {
        title: 'Free Legal Aid',
        description: 'Basic legal support for essential needs',
        features: [
          'Basic legal consultation (up to 30 minutes)',
          'Document review (up to 5 pages)',
          'Access to legal resources library',
          'Email support',
          'Standard response time (48 hours)',
          'Basic case tracking'
        ],
        price: 'Free',
        button: 'Select Free Plan'
      },
      premiumPlan: {
        title: 'Premium Legal Aid',
        description: 'Comprehensive legal support for complex cases',
        features: [
          'Extended legal consultation (up to 2 hours)',
          'Priority document review (unlimited pages)',
          'Dedicated legal representative',
          '24/7 priority support',
          'Fast response time (4 hours)',
          'Advanced case management',
          'Regular case updates',
          'Court representation'
        ],
        price: 'Premium',
        button: 'Select Premium Plan'
      },
      continue: 'Continue',
      selected: 'Selected'
    },
    am: {
      title: 'የአገልግሎት አይነትዎን ይምረጡ',
      subtitle: 'ለፍላጎትዎ የሚስማማውን አገልግሎት ይምረጡ',
      freePlan: {
        title: 'ነጻ የሕግ ድጋፍ',
        description: 'መሰረታዊ የሕግ ድጋፍ ለአስፈላጊ ፍላጎቶች',
        features: [
          'መሰረታዊ የሕግ ምክር (እስከ 30 ደቂቃ)',
          'የሰነድ ግምገማ (እስከ 5 ገጾች)',
          'የሕግ ሀብቶች ቤተ-መጽሐፍት ተደራሽነት',
          'በኢሜይል ድጋፍ',
          'መደበኛ የምላሽ ጊዜ (48 ሰዓታት)',
          'መሰረታዊ የጉዳይ ክትትል'
        ],
        price: 'ነጻ',
        button: 'ነጻ እቅድን ይምረጡ'
      },
      premiumPlan: {
        title: 'ፕሪሚየም የሕግ ድጋፍ',
        description: 'ሁሉን አቀፍ የሕግ ድጋፍ ለውስብስብ ጉዳዮች',
        features: [
          'የተራዘመ የሕግ ምክር (እስከ 2 ሰዓታት)',
          'የቅድሚያ ሰነድ ግምገማ (ያልተገደበ ገጾች)',
          'የተወሰነ የሕግ ተወካይ',
          '24/7 የቅድሚያ ድጋፍ',
          'ፈጣን የምላሽ ጊዜ (4 ሰዓታት)',
          'የላቀ የጉዳይ አያያዝ',
          'መደበኛ የጉዳይ ዝመናዎች',
          'በፍርድ ቤት ውክልና'
        ],
        price: 'ፕሪሚየም',
        button: 'ፕሪሚየም እቅድን ይምረጡ'
      },
      continue: 'ቀጥል',
      selected: 'ተመርጧል'
    }
  };

  const handleContinue = () => {
    if (!selectedService) return;
    
    // Store the selected service type
    localStorage.setItem('selectedServiceType', selectedService);
    
    // Redirect to the next step
    router.push('/client/registration');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setLanguage(lang => lang === 'en' ? 'am' : 'en')}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-lg
          hover:bg-white/20 transition-colors z-50"
      >
        <HiOutlineGlobe className="w-6 h-6 text-white" />
      </motion.button>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-12"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {translations[language].title}
          </h1>
          <p className="text-xl text-blue-200">
            {translations[language].subtitle}
          </p>
        </motion.div>

        {/* Service Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border
              transition-colors cursor-pointer ${
                selectedService === 'free'
                  ? 'border-green-400 bg-white/20'
                  : 'border-white/10 hover:border-white/30'
              }`}
            onClick={() => setSelectedService('free')}
          >
            {selectedService === 'free' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full"
              >
                <HiOutlineCheck className="w-6 h-6" />
              </motion.div>
            )}
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <HiOutlineShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {translations[language].freePlan.title}
                </h3>
                <p className="text-blue-200">
                  {translations[language].freePlan.description}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-white">
                {translations[language].freePlan.price}
              </span>
            </div>

            <ul className="space-y-4 mb-8">
              {translations[language].freePlan.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 text-gray-300"
                >
                  <HiOutlineCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border
              transition-colors cursor-pointer ${
                selectedService === 'premium'
                  ? 'border-yellow-400 bg-white/20'
                  : 'border-white/10 hover:border-white/30'
              }`}
            onClick={() => setSelectedService('premium')}
          >
            {selectedService === 'premium' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 bg-yellow-500 text-white p-2 rounded-full"
              >
                <HiOutlineCheck className="w-6 h-6" />
              </motion.div>
            )}
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <HiOutlineStar className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {translations[language].premiumPlan.title}
                </h3>
                <p className="text-blue-200">
                  {translations[language].premiumPlan.description}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-white">
                {translations[language].premiumPlan.price}
              </span>
            </div>

            <ul className="space-y-4 mb-8">
              {translations[language].premiumPlan.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 text-gray-300"
                >
                  <HiOutlineCheck className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            disabled={!selectedService}
            className={`group relative px-8 py-4 rounded-xl text-white font-semibold text-lg
              overflow-hidden transition-all ${
                selectedService
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 cursor-pointer'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
          >
            {selectedService && (
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
            )}
            <span className="flex items-center space-x-2">
              <span>{translations[language].continue}</span>
              <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ServiceSelection; 
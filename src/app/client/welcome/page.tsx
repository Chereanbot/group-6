"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  HiOutlineStar
} from 'react-icons/hi';

const WelcomeDashboard = () => {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [currentSection, setCurrentSection] = useState(0);

  const translations = {
    en: {
      welcome: 'Welcome to Dilla University Legal Aid Service',
      subtitle: 'Complete your registration to access our services',
      completeProfile: 'Complete Your Profile',
      getStarted: 'Get Started',
      freeCases: {
        title: 'Free Legal Services',
        description: 'Access essential legal support at no cost',
        features: [
          'Basic legal consultation',
          'Document review assistance',
          'Legal information and guidance',
          'Access to legal resources'
        ]
      },
      premiumCases: {
        title: 'Premium Legal Services',
        description: 'Enhanced legal support for complex cases',
        features: [
          'Priority case handling',
          'Dedicated legal representation',
          'Comprehensive case management',
          'Regular case updates and consultations'
        ]
      },
      services: {
        consultation: {
          title: 'Legal Consultation',
          description: 'Get expert advice from qualified lawyers'
        },
        documentation: {
          title: 'Document Preparation',
          description: 'Professional assistance with legal documents'
        },
        representation: {
          title: 'Court Representation',
          description: 'Expert representation in legal proceedings'
        },
        support: {
          title: 'Ongoing Support',
          description: '24/7 access to legal resources and guidance'
        }
      },
      nextSteps: {
        title: 'Next Steps',
        description: 'Complete these steps to access our services:',
        steps: [
          'Select your preferred service type',
          'Provide required documentation',
          'Schedule initial consultation',
          'Begin your legal journey'
        ]
      }
    },
    am: {
      welcome: 'እንኳን ወደ ዲላ ዩኒቨርሲቲ የሕግ ድጋፍ አገልግሎት በደህና መጡ',
      subtitle: 'አገልግሎታችንን ለማግኘት ምዝገባዎን ያጠናቅቁ',
      completeProfile: 'መገለጫዎን ያጠናቅቁ',
      getStarted: 'ይጀምሩ',
      freeCases: {
        title: 'ነጻ የሕግ አገልግሎቶች',
        description: 'መሰረታዊ የሕግ ድጋፍ ያለ ክፍያ',
        features: [
          'መሰረታዊ የሕግ ምክር',
          'የሰነድ ግምገማ ድጋፍ',
          'የሕግ መረጃ እና መመሪያ',
          'የሕግ ሀብቶችን ማግኘት'
        ]
      },
      premiumCases: {
        title: 'ፕሪሚየም የሕግ አገልግሎቶች',
        description: 'ለውስብስብ ጉዳዮች የተሻሻለ የሕግ ድጋፍ',
        features: [
          'የቅድሚያ ጉዳይ አያያዝ',
          'የተወሰነ የሕግ ውክልና',
          'ሁሉን አቀፍ የጉዳይ አያያዝ',
          'መደበኛ የጉዳይ ዝመናዎች እና ምክክሮች'
        ]
      },
      services: {
        consultation: {
          title: 'የሕግ ምክር',
          description: 'ከብቁ ጠበቆች የባለሙያ ምክር ያግኙ'
        },
        documentation: {
          title: 'የሰነድ ዝግጅት',
          description: 'ለሕግ ሰነዶች ሙያዊ ድጋፍ'
        },
        representation: {
          title: 'በፍርድ ቤት መወከል',
          description: 'በሕግ ሂደቶች ውስጥ የባለሙያ ውክልና'
        },
        support: {
          title: 'ቀጣይነት ያለው ድጋፍ',
          description: '24/7 የሕግ ሀብቶች እና መመሪያ'
        }
      },
      nextSteps: {
        title: 'ቀጣይ እርምጃዎች',
        description: 'አገልግሎታችንን ለማግኘት እነዚህን እርምጃዎች ያጠናቅቁ:',
        steps: [
          'የሚፈልጉትን የአገልግሎት አይነት ይምረጡ',
          'አስፈላጊውን ሰነድ ያቅርቡ',
          'የመጀመሪያ ምክክር ቀጠሮ ይያዙ',
          'የሕግ ጉዞዎን ይጀምሩ'
        ]
      }
    }
  };

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

  const handleContinue = () => {
    router.push('/client/registration/service-selection');
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
        {/* Welcome Header */}
        <motion.div
          variants={itemVariants}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {translations[language].welcome}
          </h1>
          <p className="text-xl text-blue-200">
            {translations[language].subtitle}
          </p>
        </motion.div>

        {/* Service Types Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Free Cases Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <HiOutlineShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {translations[language].freeCases.title}
                </h3>
                <p className="text-blue-200">
                  {translations[language].freeCases.description}
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {translations[language].freeCases.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 text-gray-300"
                >
                  <HiOutlineCheck className="w-5 h-5 text-green-400" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Premium Cases Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <HiOutlineStar className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {translations[language].premiumCases.title}
                </h3>
                <p className="text-blue-200">
                  {translations[language].premiumCases.description}
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {translations[language].premiumCases.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 text-gray-300"
                >
                  <HiOutlineCheck className="w-5 h-5 text-yellow-400" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Services Overview */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {Object.entries(translations[language].services).map(([key, service], index) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
            >
              <div className={`p-3 bg-gradient-to-br ${serviceTypes[index].color} 
                rounded-lg w-fit mb-4`}
              >
                {serviceTypes[index].icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {service.title}
              </h3>
              <p className="text-gray-300">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Next Steps Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            {translations[language].nextSteps.title}
          </h3>
          <p className="text-blue-200 mb-6">
            {translations[language].nextSteps.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {translations[language].nextSteps.steps.map((step, index) => (
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

        {/* Continue Button */}
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
              <span>{translations[language].completeProfile}</span>
              <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeDashboard; 
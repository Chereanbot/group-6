"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  HiOutlineCash,
  HiOutlineScale,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineLockClosed,
  HiOutlineLightBulb,
  HiOutlineInformationCircle,
  HiOutlineClipboardCheck,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineChat,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineBadgeCheck,
  HiOutlineExclamation,
  HiOutlineCheck,
  HiOutlineX
} from 'react-icons/hi';
import { toast } from '@/components/ui/use-toast';
import { useService } from '@/contexts/ServiceContext';
import { isFirstTimeLogin, getServiceType, setServiceType as setUserServiceType } from '@/utils/userSession';

const ServiceSelection = () => {
  const router = useRouter();
  const { setServiceType } = useService();
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showInfoTip, setShowInfoTip] = useState(true);

  const services = [
    {
      id: 'paid',
      title: t('serviceSelection.premium.title', 'Premium Legal Service'),
      description: t('serviceSelection.premium.description', 'Professional legal services with dedicated support from our top-performing lawyers'),
      icon: <HiOutlineCash className="w-12 h-12" />,
      imagePath: '/images/services/premium.png',
      benefits: [
        'Priority case handling with expedited processing',
        'Dedicated legal advisor with specialized expertise',
        'Comprehensive documentation support and preparation',
        'Regular case updates and personalized communication',
        'Premium appointment scheduling with flexible timing',
        'Direct phone access to your assigned lawyer',
        'Extended consultation hours and emergency support'
      ],
      features: [
        { icon: <HiOutlineBadgeCheck className="w-5 h-5" />, text: t('serviceSelection.premium.feature1', 'Best-performing lawyers assigned to your case') },
        { icon: <HiOutlinePhone className="w-5 h-5" />, text: t('serviceSelection.premium.feature2', 'Direct communication with your lawyer') },
        { icon: <HiOutlineCalendar className="w-5 h-5" />, text: t('serviceSelection.premium.feature3', 'Priority scheduling for appointments') },
        { icon: <HiOutlineClock className="w-5 h-5" />, text: t('serviceSelection.premium.feature4', 'Faster case processing and resolution') }
      ],
      process: [
        { step: 1, title: t('serviceSelection.premium.step1', 'Select Package'), description: t('serviceSelection.premium.step1Description', 'Choose from our tiered premium service packages') },
        { step: 2, title: t('serviceSelection.premium.step2', 'Complete Payment'), description: t('serviceSelection.premium.step2Description', 'Secure payment processing for your selected package') },
        { step: 3, title: t('serviceSelection.premium.step3', 'Lawyer Assignment'), description: t('serviceSelection.premium.step3Description', 'Get matched with our top-performing lawyers') },
        { step: 4, title: t('serviceSelection.premium.step4', 'Case Management'), description: t('serviceSelection.premium.step4Description', 'Receive premium support throughout your case') }
      ],
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'aid',
      title: t('serviceSelection.free.title', 'Free Legal Aid Service'),
      description: t('serviceSelection.free.description', 'Quality legal assistance at no cost for eligible clients through Dilla University Law School'),
      icon: <HiOutlineScale className="w-12 h-12" />,
      imagePath: '/images/services/free.png',
      benefits: [
        'Free legal consultation and advice',
        'Case registration and documentation support',
        'Professional case management by coordinators',
        'Representation by qualified student lawyers',
        'Regular case status updates',
        'Court date reminders and appointment scheduling',
        'Access to legal resources and information'
      ],
      features: [
        { icon: <HiOutlineAcademicCap className="w-5 h-5" />, text: t('serviceSelection.free.feature1', 'Supervised by experienced law professors') },
        { icon: <HiOutlineOfficeBuilding className="w-5 h-5" />, text: t('serviceSelection.free.feature2', 'Access to university legal offices') },
        { icon: <HiOutlineDocumentText className="w-5 h-5" />, text: t('serviceSelection.free.feature3', 'Complete documentation assistance') },
        { icon: <HiOutlineChat className="w-5 h-5" />, text: t('serviceSelection.free.feature4', 'Regular communication with coordinators') }
      ],
      process: [
        { step: 1, title: t('serviceSelection.free.step1', 'Register Case'), description: t('serviceSelection.free.step1Description', 'Submit your case details and documents') },
        { step: 2, title: t('serviceSelection.free.step2', 'Coordinator Review'), description: t('serviceSelection.free.step2Description', 'Case evaluation by our legal coordinators') },
        { step: 3, title: t('serviceSelection.free.step3', 'Lawyer Assignment'), description: t('serviceSelection.free.step3Description', 'Assignment to qualified student lawyers') },
        { step: 4, title: t('serviceSelection.free.step4', 'Case Management'), description: t('serviceSelection.free.step4Description', 'Ongoing support throughout your legal process') }
      ],
      color: 'from-green-500 to-emerald-600'
    }
  ];

  useEffect(() => {
    // Check if this is the user's first visit to this page
    setIsFirstVisit(isFirstTimeLogin());
    
    // Check if user already has a service type selected
    const savedServiceType = getServiceType();
    if (savedServiceType) {
      setSelectedService(savedServiceType);
    }
    
    // Add a class to the body for styling
    document.body.classList.add('service-selection-page');
    
    return () => {
      document.body.classList.remove('service-selection-page');
    };
  }, []);

  const handleSelection = (serviceId: string) => {
    setSelectedService(serviceId);
    setServiceType(serviceId as 'paid' | 'aid');
    setUserServiceType(serviceId); // Save to localStorage and cookie
    setLoading(true);
    
    // Track service selection for analytics
    try {
      // This would be an actual analytics call in production
      console.log(`Service selected: ${serviceId}`);
      // Example: analytics.track('service_selected', { serviceType: serviceId });
    } catch (error) {
      console.error('Analytics error:', error);
    }
    
    // Show success toast
    toast({
      title: t('serviceSelection.toast.title', 'Service Selected'),
      description: t('serviceSelection.toast.description', `You've selected ${serviceId === 'paid' ? 'Premium Legal Service' : 'Free Legal Aid Service'}`),
      variant: 'default',
    });
    
    setTimeout(() => {
      if (serviceId === 'paid') {
        router.push('/client/registration/payment');
      } else {
        router.push('/client/registration/legal-aid');
      }
    }, 800); // Slightly longer delay to show the loading state
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">{t('serviceSelection.loading.title', 'Processing Your Selection')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('serviceSelection.loading.description', `Preparing your ${selectedService === 'paid' ? 'premium' : 'free legal aid'} service experience...`)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('serviceSelection.title', 'Choose Your Legal Service')}
            {t('serviceSelection.subtitle', 'Choose Your Legal Service Path')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            {t('serviceSelection.description', 'Select between our premium paid legal services or free legal aid assistance. Your selection will determine the type of support and resources available for your case.')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <HiOutlineClipboardCheck className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">{t('serviceSelection.feature1', 'Professional Legal Support')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <HiOutlineAcademicCap className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">{t('serviceSelection.feature2', 'University-Backed Services')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <HiOutlineShieldCheck className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">{t('serviceSelection.feature3', 'Secure Case Management')}</span>
            </div>
          </div>
          
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-700 mx-auto rounded-full"></div>
        </motion.div>

        {/* Service Cards */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.01 }}
              className={`relative overflow-hidden rounded-2xl shadow-xl
                ${selectedService === service.id ? 'ring-4 ring-primary-500 dark:ring-primary-400' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-10 dark:opacity-20"
                style={{ 
                  background: `linear-gradient(to bottom right, ${service.id === 'paid' ? '#3B82F6, #4F46E5' : '#10B981, #059669'})` 
                }}
              />
              
              <div className="w-full bg-white dark:bg-gray-800 relative">
                {/* Service Header */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-90 z-10"
                    style={{ 
                      background: `linear-gradient(to right, ${service.id === 'paid' ? 'rgba(59, 130, 246, 0.9), rgba(79, 70, 229, 0.8)' : 'rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.8)'})` 
                    }}
                  />
                  <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <Image 
                        src={service.imagePath} 
                        alt={service.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
                    <div className={`p-3 rounded-lg bg-white/20 backdrop-blur-sm text-white inline-flex mb-4 shadow-lg`}>
                      {service.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{service.title}</h2>
                    <p className="text-white/90 text-lg max-w-md drop-shadow-md">
                      {service.description}
                    </p>
                  </div>
                </div>
                
                {/* Service Content */}
                <div className="p-8">
                  {/* Features Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('serviceSelection.features.title', 'Key Features')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <div className="text-primary-500 mt-0.5">
                            {feature.icon}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Benefits Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('serviceSelection.benefits.title', 'Benefits')}</h3>
                    <div className="space-y-3">
                      {service.benefits.slice(0, 4).map((benefit, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center space-x-3 text-left"
                        >
                          <HiOutlineShieldCheck className="w-5 h-5 text-primary-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                    {service.benefits.length > 4 && (
                      <button className="text-primary-500 hover:text-primary-600 dark:text-primary-400 text-sm mt-2 flex items-center">
                        <span>{t('serviceSelection.benefits.viewAll', 'View all {count} benefits', { count: service.benefits.length })}</span>
                        <HiOutlineArrowRight className="ml-1 w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Process Steps */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('serviceSelection.process.title', 'How It Works')}</h3>
                    <div className="flex flex-wrap">
                      {service.process.map((step, i) => (
                        <div key={i} className="flex items-start space-x-3 w-full md:w-1/2 mb-4 pr-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">{step.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Selection Button */}
                  <button
                    onClick={() => handleSelection(service.id)}
                    className={`w-full py-4 px-6 rounded-xl text-white font-medium shadow-lg flex items-center justify-center space-x-2 transition-all
                      ${service.id === 'paid' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}`}
                  >
                    <span>{t('serviceSelection.selectService', 'Select {service}', { service: service.title })}</span>
                    <HiOutlineArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('serviceSelection.comparison.title', 'Service Comparison')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('serviceSelection.comparison.description', 'Compare our services to find the right option for your needs')}</p>
          </div>
          
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider">{t('serviceSelection.comparison.features', 'Features')}</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-green-600 dark:text-green-400 tracking-wider">{t('serviceSelection.comparison.free', 'Free Legal Aid')}</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-blue-600 dark:text-blue-400 tracking-wider">{t('serviceSelection.comparison.premium', 'Premium Legal Service')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.cost', 'Cost')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.freeCost', 'Free')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.premiumCost', 'Paid packages')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.legalRepresentation', 'Legal Representation')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.freeRepresentation', 'Student lawyers')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.premiumRepresentation', 'Top-performing lawyers')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.casePriority', 'Case Priority')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.freePriority', 'Standard')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.premiumPriority', 'High priority')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.communication', 'Communication')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.freeCommunication', 'Through coordinator')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.premiumCommunication', 'Direct with lawyer')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.documentationSupport', 'Documentation Support')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    <HiOutlineShieldCheck className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    <HiOutlineShieldCheck className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.appointmentScheduling', 'Appointment Scheduling')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    <HiOutlineShieldCheck className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    <HiOutlineShieldCheck className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t('serviceSelection.comparison.emergencySupport', 'Emergency Support')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    <HiOutlineExclamation className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    <HiOutlineShieldCheck className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">{t('serviceSelection.faq.title', 'Frequently Asked Questions')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('serviceSelection.faq.description', 'Common questions about our legal services')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('serviceSelection.faq.question1', 'What is the difference between free and paid services?')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('serviceSelection.faq.answer1', 'Free legal aid is provided by student lawyers under supervision, while paid services give you access to experienced lawyers with priority handling and direct communication.')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('serviceSelection.faq.question2', 'How do I qualify for free legal aid?')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('serviceSelection.faq.answer2', 'Free legal aid is available to all clients who register through our system. Your case will be evaluated by coordinators and assigned to qualified student lawyers.')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('serviceSelection.faq.question3', 'What types of cases do you handle?')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('serviceSelection.faq.answer3', 'We handle a wide range of legal matters including civil cases, family law, property disputes, contract issues, and more. Specific specializations depend on available lawyers.')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('serviceSelection.faq.question4', 'How do I track my case progress?')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('serviceSelection.faq.answer4', 'Both service types provide case tracking through our online portal. You\'ll receive regular updates on your case status, upcoming appointments, and important documents.')}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Service Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            {t('serviceSelection.comparisonTable.title', 'Service Comparison')}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th className="p-4 text-left border-b border-gray-200 dark:border-gray-700"></th>
                  <th className="p-4 text-center border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center">
                      <HiOutlineScale className="w-8 h-8 text-green-500 mb-2" />
                      <span className="font-bold text-gray-900 dark:text-white">{t('serviceSelection.comparisonTable.free', 'Free Legal Aid')}</span>
                    </div>
                  </th>
                  <th className="p-4 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex flex-col items-center">
                      <HiOutlineCash className="w-8 h-8 text-blue-500 mb-2" />
                      <span className="font-bold text-gray-900 dark:text-white">{t('serviceSelection.comparisonTable.premium', 'Premium Service')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium">{t('serviceSelection.comparisonTable.cost', 'Cost')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700">{t('serviceSelection.comparisonTable.freeCost', 'Free')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">{t('serviceSelection.comparisonTable.premiumCost', 'Paid Plans')}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium">{t('serviceSelection.comparisonTable.legalRepresentation', 'Legal Representation')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700">{t('serviceSelection.comparisonTable.freeRepresentation', 'Student Lawyers')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">{t('serviceSelection.comparisonTable.premiumRepresentation', 'Professional Lawyers')}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium">{t('serviceSelection.comparisonTable.responseTime', 'Response Time')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700">{t('serviceSelection.comparisonTable.freeResponseTime', 'Standard')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">{t('serviceSelection.comparisonTable.premiumResponseTime', 'Priority')}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium">{t('serviceSelection.comparisonTable.caseHandling', 'Case Handling')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700">{t('serviceSelection.comparisonTable.freeCaseHandling', 'Regular Queue')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">{t('serviceSelection.comparisonTable.premiumCaseHandling', 'Expedited')}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium">{t('serviceSelection.comparisonTable.communication', 'Communication')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700">{t('serviceSelection.comparisonTable.freeCommunication', 'Through Coordinator')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">{t('serviceSelection.comparisonTable.premiumCommunication', 'Direct with Lawyer')}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium">{t('serviceSelection.comparisonTable.supportHours', 'Support Hours')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700">{t('serviceSelection.comparisonTable.freeSupportHours', 'Standard Office Hours')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">{t('serviceSelection.comparisonTable.premiumSupportHours', 'Extended Hours')}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium">{t('serviceSelection.comparisonTable.eligibility', 'Eligibility')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700">{t('serviceSelection.comparisonTable.freeEligibility', 'Subject to Approval')}</td>
                  <td className="p-4 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">{t('serviceSelection.comparisonTable.premiumEligibility', 'Available to All')}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">{t('serviceSelection.comparisonTable.bestFor', 'Best For')}</td>
                  <td className="p-4 text-center">{t('serviceSelection.comparisonTable.freeBestFor', 'Basic legal needs, limited budget')}</td>
                  <td className="p-4 text-center bg-blue-50 dark:bg-blue-900/20">{t('serviceSelection.comparisonTable.premiumBestFor', 'Complex cases, priority handling')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Contact and Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-6 mb-8"
        >
          <div className="inline-block p-1 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-md px-4 py-1">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{t('serviceSelection.helpDeciding', 'Need Help Deciding?')}</span>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('serviceSelection.supportTeam', 'Our Support Team is Ready to Assist You')}</h2>
          
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
              <HiOutlinePhone className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 dark:text-gray-300">{t('serviceSelection.phoneNumber', '+251 123 456 789')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
              <HiOutlineChat className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 dark:text-gray-300">{t('serviceSelection.liveChat', 'Live Chat Support')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
              <HiOutlineOfficeBuilding className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700 dark:text-gray-300">{t('serviceSelection.visitOffice', 'Visit Our Office')}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t('serviceSelection.officeHours', 'Our team is available Monday to Friday, 9:00 AM to 5:00 PM')}
          </p>
        </motion.div>
      </div>
      
      {/* First-time visitor info tip */}
      {isFirstVisit && showInfoTip && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-primary-500 z-50"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <HiOutlineLightBulb className="h-8 w-8 text-primary-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('serviceSelection.guide.title', 'Service Selection Guide')}</h3>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <p>{t('serviceSelection.guide.description', 'This is where you choose between paid legal services or free legal aid. Your selection will determine the next steps in your legal journey.')}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInfoTip(false)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  {t('serviceSelection.guide.gotIt', 'Got it')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Floating help button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowInfoTip(true)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-primary-500 text-white shadow-lg z-40"
      >
        <HiOutlineInformationCircle className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default ServiceSelection; 
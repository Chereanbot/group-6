"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  HiOutlineCash,
  HiOutlineScale,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineLockClosed,
  HiOutlineLightBulb,
  HiOutlineInformationCircle
} from 'react-icons/hi';
import { useService } from '@/contexts/ServiceContext';
import { isFirstTimeLogin, getServiceType, setServiceType as setUserServiceType } from '@/utils/userSession';

const ServiceSelection = () => {
  const router = useRouter();
  const { setServiceType } = useService();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showInfoTip, setShowInfoTip] = useState(true);

  const services = [
    {
      id: 'paid',
      title: 'Paid Legal Service',
      description: 'Professional legal services with dedicated support',
      icon: <HiOutlineCash className="w-12 h-12" />,
      benefits: [
        'Priority case handling',
        'Dedicated legal advisor',
        'Full documentation support',
        'Regular case updates'
      ],
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'aid',
      title: 'Legal Aid Service',
      description: 'Free legal assistance for eligible clients',
      icon: <HiOutlineScale className="w-12 h-12" />,
      benefits: [
        'Free legal consultation',
        'Basic documentation support',
        'Case management',
        'Student lawyer assistance'
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
    
    setTimeout(() => {
      if (serviceId === 'paid') {
        router.push('/client/payments/new');
      } else {
        router.push('/client/registration/legal-aid');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Overlay when loading */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <HiOutlineLockClosed className="w-20 h-20 text-primary-500 animate-bounce mb-6" />
          <span className="text-2xl font-semibold text-white mb-2">Please wait...</span>
          <span className="text-md text-gray-200">Redirecting to the next step</span>
        </div>
      )}
      <div className="max-w-5xl mx-auto">
        {/* Header with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-1 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-md px-4 py-1">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                Legal Services Selection
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Welcome to Dilla University Legal Aid
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose how you would like to proceed with your legal service. Your selection will determine the type of assistance you'll receive.
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl shadow-lg
                ${selectedService === service.id ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-10 dark:opacity-20"
                style={{ 
                  background: `linear-gradient(to bottom right, ${service.id === 'paid' ? '#3B82F6, #4F46E5' : '#10B981, #059669'})` 
                }}
              />
              
              <button
                onClick={() => handleSelection(service.id)}
                className="w-full p-8 bg-white dark:bg-gray-800 relative group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
                    {service.icon}
                  </div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="text-primary-500"
                  >
                    <HiOutlineArrowRight className="w-6 h-6" />
                  </motion.div>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-left">{service.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-left">
                  {service.description}
                </p>

                <div className="space-y-3">
                  {service.benefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center space-x-3 text-left"
                    >
                      <HiOutlineShieldCheck className="w-5 h-5 text-primary-500" />
                      <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <HiOutlineUserGroup className="w-6 h-6 text-primary-500" />
              <span className="text-gray-600 dark:text-gray-400">Expert Legal Team</span>
            </div>
            <div className="flex items-center space-x-2">
              <HiOutlineDocumentText className="w-6 h-6 text-primary-500" />
              <span className="text-gray-600 dark:text-gray-400">Full Documentation</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help choosing? Contact our support team for guidance
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
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Service Selection Guide</h3>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <p>This is where you choose between paid legal services or free legal aid. Your selection will determine the next steps in your legal journey.</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInfoTip(false)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Got it
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
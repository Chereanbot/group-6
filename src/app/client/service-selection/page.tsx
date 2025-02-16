"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  HiOutlineCash,
  HiOutlineScale,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineDocumentText
} from 'react-icons/hi';
import { useService } from '@/contexts/ServiceContext';

const ServiceSelection = () => {
  const router = useRouter();
  const { setServiceType } = useService();
  const [selectedService, setSelectedService] = useState<string | null>(null);

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

  const handleSelection = (serviceId: string) => {
    setSelectedService(serviceId);
    setServiceType(serviceId as 'paid' | 'aid');
    
    // Store selection in cookie using native API
    document.cookie = `serviceType=${serviceId};path=/;max-age=${7 * 24 * 60 * 60}`; // 7 days

    setTimeout(() => {
      if (serviceId === 'paid') {
        router.push('/client/payments/new');
      } else {
        router.push('/client/registration/legal-aid');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Welcome to Dilla University Legal Aid
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose how you would like to proceed with your legal service
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
    </div>
  );
};

export default ServiceSelection; 
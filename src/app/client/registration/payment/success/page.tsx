"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Building2, User, Briefcase } from 'lucide-react';
import Image from 'next/image';

const PaymentSuccess = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Continuous animation loop
    const steps = [
      { title: 'Payment Initiated', duration: 2000 },
      { title: 'Processing Payment', duration: 3000 },
      { title: 'Payment Confirmed', duration: 2000 },
      { title: 'Service Request Created', duration: 2000 },
    ];

    let currentIndex = 0;
    const processSteps = () => {
      if (currentIndex < steps.length) {
        setCurrentStep(currentIndex);
        setTimeout(() => {
          currentIndex++;
          if (currentIndex >= steps.length) {
            currentIndex = 0; // Reset to start for continuous animation
          }
          processSteps();
        }, steps[currentIndex].duration);
      }
    };

    processSteps();
  }, []);

  const steps = [
    {
      icon: <User className="w-6 h-6" />,
      title: 'Client Payment',
      description: 'Payment initiated from your account',
      image: '/images/payment/client-payment.png',
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Bank Processing',
      description: 'Payment being processed by the bank',
      image: '/images/payment/bank-processing.png',
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Lawyer Assignment',
      description: 'Payment transferred to lawyer account',
      image: '/images/payment/lawyer-assignment.png',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Pendding we maight Notify  as a soon!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your payment has been processed PENDING. We're now preparing your service request.
          </p>
        </motion.div>

        {/* Payment Flow Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Payment Processing Flow
          </h2>
          <div className="relative">
            {/* Animated Connection Lines */}
            <motion.div
              className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentStep >= index ? 1 : 0.5,
                    y: 0,
                    scale: currentStep >= index ? 1 : 0.95
                  }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center mb-4
                      ${currentStep >= index 
                        ? 'bg-blue-500 text-white dark:bg-blue-600' 
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}
                    `}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-[150px]">
                    {step.description}
                  </p>
                  <motion.div
                    className="mt-4 relative w-24 h-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: currentStep >= index ? 1 : 0.3 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-contain dark:brightness-90"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Payment Details
          </h2>
          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-between py-3 border-b dark:border-gray-700"
            >
              <span className="text-gray-600 dark:text-gray-300">Amount Paid</span>
              <span className="font-medium text-gray-900 dark:text-white">ETB 25,000.00</span>
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-between py-3 border-b dark:border-gray-700"
            >
              <span className="text-gray-600 dark:text-gray-300">Payment Method</span>
              <span className="font-medium text-gray-900 dark:text-white">Credit Card</span>
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between py-3 border-b dark:border-gray-700"
            >
              <span className="text-gray-600 dark:text-gray-300">Transaction ID</span>
              <span className="font-medium text-sm text-gray-900 dark:text-white">TX-1748314038286-s0urw</span>
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex justify-between py-3"
            >
              <span className="text-gray-600 dark:text-gray-300">Date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Next Steps
          </h2>
          <div className="space-y-4">
            {[
              {
                title: 'Service Request Review',
                description: 'Our team will review your service request within 24 hours.',
                delay: 0.8
              },
              {
                title: 'Lawyer Assignment',
                description: 'A qualified lawyer will be assigned to your case.',
                delay: 0.9
              },
              {
                title: 'Initial Consultation',
                description: 'Schedule your first consultation with your assigned lawyer.',
                delay: 1.0
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: step.delay }}
                className="flex items-start space-x-4"
              >
                <motion.div
                  className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{index + 1}</span>
                </motion.div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/client/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Go to Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/client/services')}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            View Services
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 
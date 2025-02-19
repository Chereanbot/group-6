"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineScale, HiOutlineCash } from 'react-icons/hi';
import { Button } from '@/components/ui/button';

export default function ServiceSelectionPage() {
  const router = useRouter();

  const handleServiceSelection = (serviceType: 'free' | 'paid') => {
    if (serviceType === 'free') {
      router.push('/client/registration');
    } else {
      router.push('/client/registration/payment');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Legal Service</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select the type of legal service that best suits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Legal Aid Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer"
          onClick={() => handleServiceSelection('free')}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-100 dark:bg-primary-900/40 p-3 rounded-full">
              <HiOutlineScale className="w-8 h-8 text-primary-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Free Legal Aid</h2>
          <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Available for eligible individuals
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Full legal support
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Document assistance
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Court representation
            </li>
          </ul>
          <Button 
            className="w-full"
            onClick={() => handleServiceSelection('free')}
          >
            Select Free Legal Aid
          </Button>
        </motion.div>

        {/* Paid Service Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer"
          onClick={() => handleServiceSelection('paid')}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
              <HiOutlineCash className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Paid Legal Service</h2>
          <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Priority case handling
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Choose your lawyer
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              24/7 support access
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Premium features
            </li>
          </ul>
          <Button 
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={() => handleServiceSelection('paid')}
          >
            Select Paid Service
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 
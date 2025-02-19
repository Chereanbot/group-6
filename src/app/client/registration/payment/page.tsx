"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const CHAPA_PUBLIC_KEY = 'CHAPUBK_TEST-40nSrRkEurW5fh4da1PD4YbDEnAEDgxg';

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const paymentPlans: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 1000,
    features: [
      'Standard case handling',
      'Email support',
      'Basic document review',
      'Single lawyer consultation'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 2500,
    features: [
      'Priority case handling',
      'Phone & email support',
      'Comprehensive document review',
      'Multiple lawyer consultations',
      'Case strategy planning'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 5000,
    features: [
      'VIP case handling',
      '24/7 support access',
      'Full document management',
      'Senior lawyer assignment',
      'Strategy & planning sessions',
      'Court representation priority'
    ]
  }
];

export default function PaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setError('Payment failed. Please try again.');
      toast({
        title: "Payment Failed",
        description: "Your payment could not be processed. Please try again.",
        variant: "destructive"
      });
    }
  }, []);

  const initializePayment = async (plan: PaymentPlan) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simple test data for Chapa test mode
      const payload = {
        amount: plan.price,
        currency: 'ETB',
        email: 'customer@email.com',
        first_name: 'John',
        last_name: 'Doe',
        customization: {
          title: 'Legal Payment',
          description: `${plan.name} Payment`
        }
      };

      console.log('Initializing payment for plan:', plan.name);

      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      if (!data.success || !data.data?.checkout_url) {
        throw new Error('Failed to get checkout URL');
      }

      // Store selected plan
      localStorage.setItem('selectedPlan', JSON.stringify({
        ...plan,
        tx_ref: data.data.tx_ref
      }));
      
      // Redirect to Chapa checkout page
      window.location.href = data.data.checkout_url;

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      setError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Payment Plan</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select a plan to proceed with payment
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            className={`
              bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer
              hover:shadow-xl transition-all duration-200
              ${isProcessing ? 'pointer-events-none opacity-50' : ''}
            `}
            onClick={() => !isProcessing && initializePayment(plan)}
          >
            <h2 className="text-xl font-semibold text-center mb-4">{plan.name}</h2>
            <div className="text-3xl font-bold text-center mb-6">
              {plan.price} ETB
            </div>
            <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">•</span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="text-center text-sm text-primary-600 dark:text-primary-400 mt-4">
              Click to select and proceed to payment
            </div>
          </motion.div>
        ))}
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Initializing Payment...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we redirect you to the payment page</p>
          </div>
        </div>
      )}
    </div>
  );
} 
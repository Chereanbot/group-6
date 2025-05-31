"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/providers/LanguageProvider';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const transactionId = searchParams.get('tx_ref');
  const amount = searchParams.get('amount');
  const paymentMethod = searchParams.get('payment_method');

  useEffect(() => {
    // Clear any payment-related state from localStorage
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('paymentMethod');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            {t('payment.success.title', 'Payment Successful!')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('payment.success.description', 'Your payment has been processed successfully.')}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {transactionId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                {t('payment.success.transactionId', 'Transaction ID')}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{transactionId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                {t('payment.success.amount', 'Amount')}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {t('payment.success.currency', 'ETB')} {parseFloat(amount).toLocaleString()}
              </span>
            </div>
          )}
          {paymentMethod && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                {t('payment.success.method', 'Payment Method')}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {t(`payment.methods.${paymentMethod}`, paymentMethod)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={() => router.push('/client/dashboard')}
            className="w-full"
          >
            {t('payment.success.goToDashboard', 'Go to Dashboard')}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/client/services')}
            className="w-full"
          >
            {t('payment.success.viewServices', 'View Services')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 
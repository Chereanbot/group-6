"use client";

import { useState } from 'react';
import { HiCheck, HiClock, HiX } from 'react-icons/hi';
import { useLanguage } from '@/providers/LanguageProvider';

const mockPayments = [
  {
    id: '1',
    date: '2024-03-05',
    amount: 1500,
    status: 'completed',
    method: 'TeleBirr',
    reference: 'PAY-123456'
  },
  {
    id: '2',
    date: '2024-03-03',
    amount: 2000,
    status: 'pending',
    method: 'CBE Birr',
    reference: 'PAY-123457'
  },
  // Add more mock data as needed
];

const statusIcons = {
  completed: <HiCheck className="w-5 h-5 text-green-500" />,
  pending: <HiClock className="w-5 h-5 text-yellow-500" />,
  failed: <HiX className="w-5 h-5 text-red-500" />
};

export default function PaymentHistory() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t('paymentHistory.title', 'Payment History')}</h1>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        {['all', 'completed', 'pending', 'failed'].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg capitalize
              ${filter === status 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800'}`}
            onClick={() => setFilter(status)}
          >
            {t(`paymentHistory.filters.${status}`, status)}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-4">{t('paymentHistory.table.date', 'Date')}</th>
              <th className="text-left py-4">{t('paymentHistory.table.reference', 'Reference')}</th>
              <th className="text-left py-4">{t('paymentHistory.table.method', 'Method')}</th>
              <th className="text-right py-4">{t('paymentHistory.table.amount', 'Amount')}</th>
              <th className="text-center py-4">{t('paymentHistory.table.status', 'Status')}</th>
            </tr>
          </thead>
          <tbody>
            {mockPayments.map((payment) => (
              <tr 
                key={payment.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="py-4">{payment.date}</td>
                <td className="py-4">{payment.reference}</td>
                <td className="py-4">{payment.method}</td>
                <td className="py-4 text-right">{payment.amount} ETB</td>
                <td className="py-4">
                  <div className="flex items-center justify-center space-x-2">
                    {statusIcons[payment.status]}
                    <span className="capitalize">{t(`paymentHistory.status.${payment.status}`, payment.status)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
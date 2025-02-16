"use client";

import { useState } from 'react';
import { HiCreditCard, HiCash, HiOutlineQrcode } from 'react-icons/hi';

const paymentMethods = [
  {
    id: 'card',
    title: 'Credit/Debit Card',
    icon: <HiCreditCard className="w-6 h-6" />,
    description: 'Pay securely with your card'
  },
  {
    id: 'telebirr',
    title: 'TeleBirr',
    icon: <HiOutlineQrcode className="w-6 h-6" />,
    description: 'Pay using TeleBirr mobile money'
  },
  {
    id: 'cbe',
    title: 'CBE Birr',
    icon: <HiCash className="w-6 h-6" />,
    description: 'Pay using CBE Birr'
  }
];

export default function MakePayment() {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Make Payment</h1>
      
      {/* Amount Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Amount (ETB)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Enter amount"
        />
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all
              ${selectedMethod === method.id 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                : 'hover:border-gray-400'}`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="text-primary-500">{method.icon}</div>
              <div>
                <h3 className="font-medium">{method.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {method.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Button */}
      <button
        className="w-full mt-8 bg-primary-500 text-white py-3 rounded-lg
          hover:bg-primary-600 transition-colors disabled:opacity-50"
        disabled={!selectedMethod || !amount}
      >
        Pay {amount ? `${amount} ETB` : ''}
      </button>
    </div>
  );
} 
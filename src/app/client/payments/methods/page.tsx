"use client";

import { useState } from 'react';
import { HiCreditCard, HiPhone, HiPlus, HiTrash } from 'react-icons/hi';

const mockPaymentMethods = [
  {
    id: '1',
    type: 'card',
    name: 'Visa Card',
    last4: '4242',
    expiry: '12/25'
  },
  {
    id: '2',
    type: 'telebirr',
    name: 'TeleBirr',
    phone: '0947******69'
  }
];

export default function PaymentMethods() {
  const [showAddNew, setShowAddNew] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <button
          onClick={() => setShowAddNew(true)}
          className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg
            hover:bg-primary-600 transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add New</span>
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {mockPaymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                {method.type === 'card' ? (
                  <HiCreditCard className="w-8 h-8 text-primary-500" />
                ) : (
                  <HiPhone className="w-8 h-8 text-primary-500" />
                )}
                <div>
                  <h3 className="font-semibold">{method.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {method.type === 'card' 
                      ? `**** **** **** ${method.last4}`
                      : method.phone
                    }
                  </p>
                  {method.type === 'card' && (
                    <p className="text-sm text-gray-500">
                      Expires: {method.expiry}
                    </p>
                  )}
                </div>
              </div>
              <button
                className="text-red-500 hover:text-red-600 p-2"
                onClick={() => {/* Handle delete */}}
              >
                <HiTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Method Modal */}
      {showAddNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>
            {/* Add form fields here */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowAddNew(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary-500 text-white rounded-lg
                  hover:bg-primary-600"
              >
                Add Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
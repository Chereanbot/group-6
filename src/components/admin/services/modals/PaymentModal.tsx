"use client";

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ServiceRequest, PaymentStatus } from '@/types/service.types';
import { formatCurrency } from '@/utils/format';
import { HiOutlineCreditCard, HiOutlineCash, HiOutlineReceiptTax } from 'react-icons/hi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onSuccess: () => void;
}

type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CASH';

interface PaymentFormData {
  method: PaymentMethod;
  transactionId?: string;
  amount: number;
  notes: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  request,
  onSuccess
}: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    method: 'CARD',
    amount: request.package.price,
    notes: ''
  });

  const paymentMethods = [
    {
      id: 'CARD',
      name: 'Credit/Debit Card',
      icon: HiOutlineCreditCard,
      description: 'Pay using credit or debit card'
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Bank Transfer',
      icon: HiOutlineReceiptTax,
      description: 'Direct bank transfer'
    },
    {
      id: 'CASH',
      name: 'Cash Payment',
      icon: HiOutlineCash,
      description: 'Pay in cash at office'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Here you would integrate with your payment processing service
      // For example: Stripe, PayPal, etc.
      const paymentResult = await processPayment(formData);
      
      // Update the service request with payment information
      await updatePaymentStatus(request.id, {
        status: PaymentStatus.PAID,
        transactionId: paymentResult.transactionId,
        amount: formData.amount,
        method: formData.method,
        notes: formData.notes
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock function - replace with actual payment processing
  const processPayment = async (data: PaymentFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { transactionId: `TXN-${Date.now()}` };
  };

  // Mock function - replace with actual API call
  const updatePaymentStatus = async (requestId: string, paymentData: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Process Payment
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Service Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Service Package
                    </h4>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {request.package.name}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(request.package.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Method
                    </label>
                    <div className="mt-2 space-y-2">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            formData.method === method.id ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={formData.method === method.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as PaymentMethod }))}
                            className="sr-only"
                          />
                          <method.icon className={`w-6 h-6 ${
                            formData.method === method.id ? 'text-primary-500' : 'text-gray-400'
                          }`} />
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${
                              formData.method === method.id ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {method.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {method.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                        className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Add any notes about the payment..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : 'Process Payment'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 
"use client";

import { useState } from 'react';
import { HiDownload, HiEye, HiPrinter } from 'react-icons/hi';

const mockInvoices = [
  {
    id: 'INV-2024-001',
    date: '2024-03-05',
    dueDate: '2024-03-20',
    amount: 1500,
    status: 'unpaid',
    description: 'Legal Consultation Fee'
  },
  {
    id: 'INV-2024-002',
    date: '2024-03-03',
    dueDate: '2024-03-18',
    amount: 2000,
    status: 'paid',
    description: 'Document Processing'
  },
];

export default function Invoices() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        {['all', 'paid', 'unpaid', 'overdue'].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg capitalize
              ${filter === status 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800'}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {mockInvoices.map((invoice) => (
          <div 
            key={invoice.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{invoice.id}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {invoice.description}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm capitalize
                ${invoice.status === 'paid' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {invoice.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Issue Date</p>
                <p className="font-medium">{invoice.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                <p className="font-medium">{invoice.dueDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                <p className="font-medium">{invoice.amount} ETB</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 text-primary-500 hover:text-primary-600">
                <HiEye className="w-5 h-5" />
                <span>View</span>
              </button>
              <button className="flex items-center space-x-2 text-primary-500 hover:text-primary-600">
                <HiDownload className="w-5 h-5" />
                <span>Download</span>
              </button>
              <button className="flex items-center space-x-2 text-primary-500 hover:text-primary-600">
                <HiPrinter className="w-5 h-5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
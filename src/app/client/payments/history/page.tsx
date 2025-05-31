"use client";

import { useState } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search } from 'lucide-react';

export default function PaymentHistory() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual data fetching
  const payments = [
    {
      id: '1',
      date: '2024-03-15',
      reference: 'PAY-001',
      method: 'credit_card',
      amount: 25000,
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-03-14',
      reference: 'PAY-002',
      method: 'bank_transfer',
      amount: 35000,
      status: 'pending'
    },
    {
      id: '3',
      date: '2024-03-13',
      reference: 'PAY-003',
      method: 'telebirr',
      amount: 50000,
      status: 'failed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t('payment.history.title', 'Payment History')}</h1>

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
            {t(`payment.history.filters.${status}`, status)}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('payment.history.search', 'Search payments...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('payment.history.sortBy', 'Sort by')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">{t('payment.history.sort.dateDesc', 'Date (Newest)')}</SelectItem>
            <SelectItem value="date_asc">{t('payment.history.sort.dateAsc', 'Date (Oldest)')}</SelectItem>
            <SelectItem value="amount_desc">{t('payment.history.sort.amountDesc', 'Amount (High to Low)')}</SelectItem>
            <SelectItem value="amount_asc">{t('payment.history.sort.amountAsc', 'Amount (Low to High)')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('payment.history.table.date', 'Date')}</TableHead>
              <TableHead>{t('payment.history.table.reference', 'Reference')}</TableHead>
              <TableHead>{t('payment.history.table.method', 'Method')}</TableHead>
              <TableHead className="text-right">{t('payment.history.table.amount', 'Amount')}</TableHead>
              <TableHead className="text-center">{t('payment.history.table.status', 'Status')}</TableHead>
              <TableHead className="text-right">{t('payment.history.table.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                <TableCell>{payment.reference}</TableCell>
                <TableCell>{t(`payment.methods.${payment.method}`, payment.method)}</TableCell>
                <TableCell className="text-right">
                  {payment.amount.toLocaleString()} {t('payment.currency', 'ETB')}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getStatusColor(payment.status)}>
                    {t(`payment.status.${payment.status}`, payment.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t('payment.history.table.download', 'Download')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* No Results */}
      {payments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t('payment.history.noPayments', 'No payment history found')}
          </p>
        </div>
      )}
    </div>
  );
} 
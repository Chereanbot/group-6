"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { PaymentStatus } from '@prisma/client';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/providers/LanguageProvider';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  transactionId: string;
  description: string;
  createdAt: string;
  paidAt: string | null;
  serviceRequest: {
    id: string;
    title: string;
    package: {
      name: string;
      serviceType: string;
    };
  };
  metadata: any;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PaymentHistory() {
  const router = useRouter();
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && filters.status !== 'ALL' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() })
      });

      const response = await fetch(`/api/payment/history?${queryParams}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setPayments(data.data.payments);
      setPagination(data.data.pagination);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch payment history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, filters]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case PaymentStatus.FAILED:
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case PaymentStatus.PENDING:
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <CheckCircle2 className="w-4 h-4" />;
      case PaymentStatus.FAILED:
        return <XCircle className="w-4 h-4" />;
      case PaymentStatus.PENDING:
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/payment/history/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export payment history",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('payment.history.loading', 'Loading payment history...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('payment.history.title', 'Payment History')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('payment.history.description', 'View and manage your payment transactions')}
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, "PPP") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filters.startDate || undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, "PPP") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {payment.serviceRequest?.package?.name || 'Unknown Package'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.serviceRequest?.title || 'No Title'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                              getStatusColor(payment.status)
                            )}>
                              {getStatusIcon(payment.status)}
                              {t(`payment.status.${payment.status}`, payment.status)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/client/registration/payment/${payment.id}`)}
                          >
                            <Receipt className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && payments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4"
        >
          <div className="mx-auto w-48 h-48 text-gray-400 dark:text-gray-600">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M100 140C122.091 140 140 122.091 140 100C140 77.9086 122.091 60 100 60C77.9086 60 60 77.9086 60 100C60 122.091 77.9086 140 100 140Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M100 100L100 100"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
            {filters.search || filters.status !== 'ALL' || filters.startDate || filters.endDate
              ? "No matching payments found"
              : "No payment history yet"}
          </h3>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {filters.search || filters.status !== 'ALL' || filters.startDate || filters.endDate
              ? "Try adjusting your filters or search criteria to find what you're looking for."
              : "When you make payments for services, they will appear here. You can track all your transactions and download payment history."}
          </p>
          {filters.search || filters.status !== 'ALL' || filters.startDate || filters.endDate ? (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setFilters({
                status: 'ALL',
                search: '',
                startDate: null,
                endDate: null
              })}
            >
              Clear Filters
            </Button>
          ) : (
            <div className="mt-6 space-x-4">
              <Button
                onClick={() => router.push('/client/registration/payment')}
                className="bg-primary hover:bg-primary/90"
              >
                {t('payment.history.makePayment', 'Make a Payment')}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/client/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
} 
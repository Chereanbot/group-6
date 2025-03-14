"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PaymentStatus } from '@prisma/client';
import { format, parseISO } from 'date-fns';

interface PaymentRequest {
  id: string;
  referenceNumber: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  processedAt: string | null;
  notes: string | null;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
  };
}

interface Summary {
  total: number;
  totalAmount: number;
  pending: number;
  completed: number;
  failed: number;
}

export default function PaymentRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    totalAmount: 0,
    pending: 0,
    completed: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [updateStatus, setUpdateStatus] = useState<PaymentStatus | ''>('');
  const [notes, setNotes] = useState('');

  const getUserInfo = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please log in to access this page');
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Cookie': `auth-token=${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again');
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setUserId(data.data.id);
      } else {
        throw new Error(data.message || 'Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      toast.error('Failed to fetch user information');
      router.push('/auth/login');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please log in to access this page');
        router.push('/auth/login');
        return;
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        ...filters,
        status: filters.status === 'all' ? '' : filters.status
      });

      const response = await fetch(`/api/services/payment-requests?${queryParams.toString()}`, {
        headers: {
          'Cookie': `auth-token=${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in to access this page');
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch payment requests');
      }

      const data = await response.json();
      if (data.success) {
        setRequests(data.data.requests);
        setSummary(data.data.summary);
      } else {
        throw new Error(data.message || 'Failed to fetch payment requests');
      }
    } catch (error) {
      console.error('Error loading payment requests:', error);
      toast.error('Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserInfo().then(() => {
      loadData();
    });
  }, [filters]);

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !updateStatus) {
      toast.error('Please select a status');
      return;
    }

    if (!userId) {
      toast.error('User information not available');
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please log in to continue');
        router.push('/auth/login');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Updating payment request...');

      const response = await fetch(`/api/services/payment-requests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          id: selectedRequest.id,
          status: updateStatus,
          notes: notes.trim() ? {
            create: {
              content: notes.trim(),
              type: 'STATUS_UPDATE',
              user: {
                connect: {
                  id: userId
                }
              }
            }
          } : undefined,
          processedAt: updateStatus === PaymentStatus.COMPLETED ? new Date().toISOString() : null
        })
      });

      const data = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in to continue');
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || data.message || 'Failed to update payment request');
      }

      if (data.success) {
        toast.success('Payment request updated successfully');
        setUpdateDialog(false);
        setSelectedRequest(null);
        setUpdateStatus('');
        setNotes('');
        loadData(); // Reload the data to reflect changes
      } else {
        throw new Error(data.message || 'Failed to update payment request');
      }
    } catch (error) {
      console.error('Error updating payment request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update payment request');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to continue');
        router.push('/login');
        return;
      }

      // Build query parameters for export
      const queryParams = new URLSearchParams({
        ...filters,
        status: filters.status === 'all' ? '' : filters.status
      });

      const response = await fetch(`/api/services/payment-requests/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in to continue');
          router.push('/login');
          return;
        }
        throw new Error('Failed to export payment requests');
      }

      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-requests-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting payment requests:', error);
      toast.error('Failed to export payment requests');
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case PaymentStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case PaymentStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      case PaymentStatus.REFUNDED:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case PaymentStatus.WAIVED:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleReset = () => {
    setFilters({
      status: 'all',
      search: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payment Requests</h1>
          <p className="text-gray-500">Manage and process client payment requests</p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BanknotesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              Total amount: ${summary.totalAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.failed}</div>
            <p className="text-xs text-muted-foreground">Processing failed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name, email, or reference..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-8"
            />
          </div>
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(PaymentStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          className="w-[180px]"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          className="w-[180px]"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Processed At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No payment requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.referenceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.client.fullName}</div>
                      <div className="text-sm text-muted-foreground">{request.client.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.service.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {request.service.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${request.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.createdAt ? (
                      format(parseISO(request.createdAt), 'MMM d, yyyy HH:mm')
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {request.processedAt ? (
                      format(parseISO(request.processedAt), 'MMM d, yyyy HH:mm')
                    ) : (
                      'Pending'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setUpdateStatus(request.status);
                        setNotes(request.notes || '');
                        setUpdateDialog(true);
                      }}
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Request Status</DialogTitle>
            <DialogDescription>
              Update the status and add notes for this payment request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={updateStatus} 
                onValueChange={(value: PaymentStatus) => setUpdateStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PaymentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this payment request..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
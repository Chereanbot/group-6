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
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PaymentStatus, RequestStatus } from '@prisma/client';
import { format, parseISO } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';

interface PaymentRequest {
  id: string;
  title: string;
  description?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  submittedAt: string;
  completedAt?: string;
  quotedPrice?: number;
  finalPrice?: number;
  metadata?: {
    price?: number;
    category?: string;
    [key: string]: any;
  };
  client?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    clientProfile?: {
      region: string;
      zone: string;
      wereda: string;
      kebele: string;
    };
  };
  service?: {
    name: string;
    category: string;
  };
  assignedLawyer?: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface Summary {
  total: number;
  totalAmount: number;
  pending: number;
  completed: number;
  failed: number;
  byCategory: {
    [key: string]: number;
  };
  byRegion: {
    [key: string]: number;
  };
  dailyStats: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}

export default function PaymentRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    totalAmount: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    byCategory: {},
    byRegion: {},
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
    category: 'all',
    region: 'all',
    assignedLawyer: 'all'
  });
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [updateStatus, setUpdateStatus] = useState<PaymentStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [bulkActions, setBulkActions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
        status: filters.status === 'all' ? '' : filters.status,
        category: filters.category === 'all' ? '' : filters.category,
        region: filters.region === 'all' ? '' : filters.region
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
        const transformedRequests = data.data.requests.map((request: any) => ({
          ...request,
          amount: request.quotedPrice || request.finalPrice || (request.metadata?.price) || 0,
          createdAt: request.submittedAt,
          service: {
            name: request.title,
            category: request.metadata?.category || 'Uncategorized'
          }
        }));

        // Calculate summary
        const summary = {
          total: transformedRequests.length,
          totalAmount: transformedRequests.reduce((sum: number, req: any) => sum + (req.amount || 0), 0),
          pending: transformedRequests.filter((req: any) => req.paymentStatus === PaymentStatus.PENDING).length,
          completed: transformedRequests.filter((req: any) => req.paymentStatus === PaymentStatus.COMPLETED).length,
          failed: transformedRequests.filter((req: any) => req.paymentStatus === PaymentStatus.FAILED).length,
          byCategory: transformedRequests.reduce((acc: any, req: any) => {
            const category = req.service.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {}),
          byRegion: transformedRequests.reduce((acc: any, req: any) => {
            const region = req.client?.clientProfile?.region || 'Unknown';
            acc[region] = (acc[region] || 0) + 1;
            return acc;
          }, {}),
          dailyStats: Object.entries(
            transformedRequests.reduce((acc: any, req: any) => {
              const date = new Date(req.createdAt).toISOString().split('T')[0];
              if (!acc[date]) {
                acc[date] = { count: 0, amount: 0 };
              }
              acc[date].count++;
              acc[date].amount += (req.amount || 0);
              return acc;
            }, {})
          ).map(([date, stats]: [string, any]) => ({
            date,
            ...stats
          })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        };

        setRequests(transformedRequests);
        setSummary(summary);
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

  const handleBulkUpdate = async () => {
    if (bulkActions.length === 0) {
      toast.error('Please select requests to update');
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please log in to continue');
        router.push('/auth/login');
        return;
      }

      const loadingToast = toast.loading('Updating selected requests...');

      const response = await fetch(`/api/services/payment-requests/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ids: bulkActions,
          status: updateStatus,
          notes: notes.trim() ? {
            content: notes.trim(),
            userId: userId
          } : undefined
        })
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update requests');
      }

      toast.success('Successfully updated selected requests');
      setBulkActions([]);
      setUpdateDialog(false);
      loadData();
    } catch (error) {
      console.error('Error updating requests:', error);
      toast.error('Failed to update requests');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please log in to continue');
        router.push('/auth/login');
        return;
      }

      const loadingToast = toast.loading('Preparing export...');

      const response = await fetch(`/api/services/payment-requests/export?format=${exportFormat}`, {
        headers: {
          'Cookie': `auth-token=${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-requests-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss(loadingToast);
      toast.success('Export completed successfully');
      setExportDialog(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
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
      endDate: '',
      category: 'all',
      region: 'all',
      assignedLawyer: 'all'
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Requests</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => setExportDialog(true)}
            className="flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
            className="flex items-center gap-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            {viewMode === 'list' ? 'View Charts' : 'View List'}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {Object.keys(summary.byCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Region</label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => setFilters({ ...filters, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {Object.keys(summary.byRegion).map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-medium">Date Range</label>
                <DateRangePicker
                  value={{
                    from: filters.startDate ? new Date(filters.startDate) : undefined,
                    to: filters.endDate ? new Date(filters.endDate) : undefined
                  }}
                  onChange={(range) => {
                    if (range) {
                      setFilters({
                        ...filters,
                        startDate: range.from?.toISOString() || '',
                        endDate: range.to?.toISOString() || ''
                      });
                    }
                  }}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search by client name, email, or reference number"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              Total amount: ETB {summary.totalAmount.toLocaleString()}
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
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.failed}</div>
            <p className="text-xs text-muted-foreground">
              Processing failed
            </p>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={bulkActions.length === requests.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkActions(requests.map(r => r.id));
                        } else {
                          setBulkActions([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={bulkActions.includes(request.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkActions([...bulkActions, request.id]);
                          } else {
                            setBulkActions(bulkActions.filter(id => id !== request.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.client?.fullName || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{request.client?.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.service?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{request.service?.category || 'Uncategorized'}</div>
                      </div>
                    </TableCell>
                    <TableCell>ETB {(request.amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.paymentStatus === PaymentStatus.COMPLETED
                            ? 'default'
                            : request.paymentStatus === PaymentStatus.PENDING
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {request.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.submittedAt ? format(new Date(request.submittedAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setUpdateDialog(true);
                        }}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.dailyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      formatter={(value, name) => [
                        name === 'count' ? value : `ETB ${value.toLocaleString()}`,
                        name === 'count' ? 'Requests' : 'Amount'
                      ]}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      name="Requests"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#82ca9d" 
                      name="Amount"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Requests by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={Object.entries(summary.byCategory || {}).map(([name, value]) => ({ 
                      name: name || 'Uncategorized', 
                      value 
                    }))}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Request</DialogTitle>
            <DialogDescription>
              Update the status of the selected payment request(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={updateStatus}
                onValueChange={(value) => setUpdateStatus(value as PaymentStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this update"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={bulkActions.length > 0 ? handleBulkUpdate : handleUpdateStatus}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialog} onOpenChange={setExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Payment Requests</DialogTitle>
            <DialogDescription>
              Choose the format to export the payment requests data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Format</label>
              <Select
                value={exportFormat}
                onValueChange={(value: 'csv' | 'excel') => setExportFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
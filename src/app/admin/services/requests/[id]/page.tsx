'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  ExternalLink, 
  Package, 
  User, 
  Briefcase, 
  DollarSign, 
  CreditCard, 
  History, 
  Calendar,
  FileText,
  Building,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceRequest {
  id: string;
  title: string;
  status: string;
  paymentStatus: string;
  quotedPrice: number | null;
  finalPrice: number | null;
  package: {
    name: string;
    serviceType: string;
  };
  client: {
    id: string;
    fullName: string;
    email: string;
  };
  assignedLawyer?: {
    id: string;
    fullName: string;
    email: string;
  };
  payments: {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    transactionId: string;
    createdAt: string;
  }[];
}

export default function ServiceRequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/services/requests/${resolvedParams.id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setServiceRequest(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!serviceRequest) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/services/requests/${resolvedParams.id}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update payment status');
      }

      setServiceRequest(result.data);
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewChapaOverview = () => {
    window.open('https://dashboard.chapa.co/dashboard/overview/', '_blank');
  };

  const handleViewChapaTransactions = () => {
    window.open('https://dashboard.chapa.co/dashboard/transactions', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!serviceRequest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Service request not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Service Request Details
          </CardTitle>
          <CardDescription>
            Manage service request: {serviceRequest.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Request Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Package</p>
                    <p className="font-medium">{serviceRequest.package.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Type</p>
                    <p className="font-medium">{serviceRequest.package.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant="outline">{serviceRequest.status}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{serviceRequest.client.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{serviceRequest.client.email}</p>
                  </div>
                </div>
              </div>

              {serviceRequest.assignedLawyer && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Assigned Lawyer
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{serviceRequest.assignedLawyer.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{serviceRequest.assignedLawyer.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Quoted Price</p>
                    <p className="font-medium">
                      ${serviceRequest.quotedPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Final Price</p>
                    <p className="font-medium">
                      ${serviceRequest.finalPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <div className="flex items-center gap-2">
                      <Select
                        value={serviceRequest.paymentStatus}
                        onValueChange={handlePaymentStatusChange}
                        disabled={updating}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Payment History
                </h3>
                {serviceRequest.payments.length > 0 ? (
                  <div className="space-y-2">
                    {serviceRequest.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-3 border rounded-lg space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <p className="font-medium">${payment.amount.toFixed(2)}</p>
                          </div>
                          <Badge variant="outline">{payment.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Receipt className="h-4 w-4" />
                          {payment.paymentMethod} - {payment.transactionId}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No payment history available</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleViewChapaOverview}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Chapa Overview
                </Button>
                <Button
                  onClick={handleViewChapaTransactions}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Chapa Transactions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
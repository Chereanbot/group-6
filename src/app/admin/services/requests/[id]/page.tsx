'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

interface ServiceRequestDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  paymentStatus: string;
  quotedPrice: number;
  finalPrice: number;
  client: {
    fullName: string;
    email: string;
    phone: string;
  };
  package: {
    name: string;
    serviceType: string;
    description: string;
  };
  assignedLawyer: {
    fullName: string;
    email: string;
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
  }>;
  serviceDocuments: Array<{
    document: {
      title: string;
      type: string;
      path: string;
    };
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ServiceRequestDetailsPage() {
  const params = useParams();
  const [request, setRequest] = useState<ServiceRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/services/requests/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setRequest(data.data);
        }
      } catch (error) {
        console.error('Error fetching request details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!request) {
    return <div>Request not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Request Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-medium">Title</label>
                  <p>{request.title}</p>
                </div>
                <div>
                  <label className="font-medium">Description</label>
                  <p>{request.description}</p>
                </div>
                <div>
                  <label className="font-medium">Status</label>
                  <Badge>{request.status}</Badge>
                </div>
                <div>
                  <label className="font-medium">Payment Status</label>
                  <Badge>{request.paymentStatus}</Badge>
                </div>
                <div>
                  <label className="font-medium">Amount</label>
                  <p>{formatCurrency(request.finalPrice || request.quotedPrice)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Client Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-medium">Name</label>
                  <p>{request.client.fullName}</p>
                </div>
                <div>
                  <label className="font-medium">Email</label>
                  <p>{request.client.email}</p>
                </div>
                <div>
                  <label className="font-medium">Phone</label>
                  <p>{request.client.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>
            <div className="space-y-4">
              {request.payments.map((payment) => (
                <div key={payment.id} className="border p-4 rounded">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-500">{payment.method}</p>
                    </div>
                    <Badge>{payment.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Documents</h3>
            <div className="space-y-4">
              {request.serviceDocuments.map((doc, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{doc.document.title}</p>
                      <p className="text-sm text-gray-500">{doc.document.type}</p>
                    </div>
                    <Badge>{doc.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
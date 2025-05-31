'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  FileText, 
  Calendar, 
  MessageSquare, 
  Clock,
  Building2,
  User,
  Download,
  Plus,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';

interface CaseDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  assignedOffice: {
    id: string;
    name: string;
    address: string;
    contactPhone: string;
    contactEmail: string;
  };
  documents: Array<{
    id: string;
    title: string;
    type: string;
    path: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    createdAt: string;
    caseId: string;
    userId: string;
  }>;
  caseEvents: Array<{
    id: string;
    title: string;
    description: string;
    start: string;
    end: string;
    status: string;
  }>;
}

export default function CaseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCaseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client/cases/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      const data = await response.json();
      if (data.success) {
        setCaseDetails(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load case details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchCaseDetails();
  }, [fetchCaseDetails]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              fetchCaseDetails();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!caseDetails) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{caseDetails.title}</h1>
            <p className="text-gray-500 mt-1">Case ID: {caseDetails.id}</p>
          </div>
        </div>
        <Badge variant={caseDetails.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {caseDetails.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Case Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{caseDetails.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(caseDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {new Date(caseDetails.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Office Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Office Name</p>
              <p className="font-medium">{caseDetails.assignedOffice.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{caseDetails.assignedOffice.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{caseDetails.assignedOffice.contactPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{caseDetails.assignedOffice.contactEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid grid-cols-3 gap-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseDetails.caseEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={event.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Case Documents</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push(`/client/cases/${params.id}/documents/upload`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseDetails.documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-gray-500">
                          Type: {doc.type} | Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Case Activities</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push(`/client/cases/${params.id}/activities/new`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Activity
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseDetails.activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Type: {activity.type}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  User, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Bell, 
  Settings,
  Shield,
  MapPin,
  Phone,
  Mail,
  Users,
  Heart,
  Edit2,
  Save,
  X,
  Download,
  Eye,
  Clock,
  Building2
} from 'lucide-react';

interface ClientInfo {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    username: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    status: string;
    createdAt: string;
  };
  profile: {
    age: number;
    sex: string;
    numberOfFamily: number;
    healthStatus: string;
    region: string;
    zone: string;
    wereda: string;
    kebele: string;
    houseNumber: string;
    caseType: string;
    caseCategory: string;
    officeId: string;
    guidelines: string;
    notes: string;
  };
  cases: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
  appointments: Array<{
    id: string;
    purpose: string;
    scheduledTime: string;
    status: string;
  }>;
  messages: Array<{
    id: string;
    text: string;
    createdAt: string;
    status: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
    status: string;
  }>;
}

export default function ClientInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchClientInfo();
  }, []);

  const fetchClientInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/myinfo');
      if (!response.ok) {
        throw new Error('Failed to fetch client information');
      }
      const data = await response.json();
      setClientInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load client information');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: string, data: any) => {
    setEditing(section);
    setEditData(data);
  };

  const handleSave = async (section: string) => {
    try {
      const response = await fetch(`/api/client/myinfo/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to update');
      
      await fetchClientInfo();
      setEditing(null);
      toast.success('Information updated successfully');
    } catch (err) {
      toast.error('Failed to update information');
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setEditData({});
  };

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
            onClick={() => router.refresh()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!clientInfo) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Information</h1>
          <p className="text-gray-500 mt-1">Manage your profile and view your case information</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push('/client/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="default"
            onClick={() => router.push('/client/dashboard')}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Dashboard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-6 gap-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                {editing !== 'personal' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('personal', {
                      fullName: clientInfo?.user.fullName,
                      username: clientInfo?.user.username,
                      age: clientInfo?.profile.age,
                      sex: clientInfo?.profile.sex,
                      numberOfFamily: clientInfo?.profile.numberOfFamily,
                      healthStatus: clientInfo?.profile.healthStatus,
                    })}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('personal')}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editing === 'personal' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Full Name</label>
                      <Input
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Username</label>
                      <Input
                        value={editData.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Age</label>
                      <Input
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Gender</label>
                      <Input
                        value={editData.sex}
                        onChange={(e) => setEditData({ ...editData, sex: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Family Members</label>
                      <Input
                        type="number"
                        value={editData.numberOfFamily}
                        onChange={(e) => setEditData({ ...editData, numberOfFamily: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Health Status</label>
                      <Input
                        value={editData.healthStatus}
                        onChange={(e) => setEditData({ ...editData, healthStatus: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{clientInfo?.user.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{clientInfo?.user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{clientInfo?.profile.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{clientInfo?.profile.sex}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Family Members</p>
                      <p className="font-medium">{clientInfo?.profile.numberOfFamily}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Health Status</p>
                      <p className="font-medium">{clientInfo?.profile.healthStatus}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Information
                </CardTitle>
                {editing !== 'contact' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('contact', {
                      email: clientInfo?.user.email,
                      phone: clientInfo?.user.phone,
                    })}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('contact')}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editing === 'contact' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone</label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <div className="flex items-center">
                        <p className="font-medium">{clientInfo?.user.email}</p>
                        {clientInfo?.user.emailVerified && (
                          <Badge variant="default" className="ml-2">Verified</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <div className="flex items-center">
                        <p className="font-medium">{clientInfo?.user.phone}</p>
                        {clientInfo?.user.phoneVerified && (
                          <Badge variant="default" className="ml-2">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Information
                </CardTitle>
                {editing !== 'location' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('location', {
                      region: clientInfo?.profile.region,
                      zone: clientInfo?.profile.zone,
                      wereda: clientInfo?.profile.wereda,
                      kebele: clientInfo?.profile.kebele,
                      houseNumber: clientInfo?.profile.houseNumber,
                    })}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave('location')}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editing === 'location' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Region</label>
                      <Input
                        value={editData.region}
                        onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Zone</label>
                      <Input
                        value={editData.zone}
                        onChange={(e) => setEditData({ ...editData, zone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Wereda</label>
                      <Input
                        value={editData.wereda}
                        onChange={(e) => setEditData({ ...editData, wereda: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Kebele</label>
                      <Input
                        value={editData.kebele}
                        onChange={(e) => setEditData({ ...editData, kebele: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">House Number</label>
                      <Input
                        value={editData.houseNumber}
                        onChange={(e) => setEditData({ ...editData, houseNumber: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Region</p>
                      <p className="font-medium">{clientInfo?.profile.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Zone</p>
                      <p className="font-medium">{clientInfo?.profile.zone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wereda</p>
                      <p className="font-medium">{clientInfo?.profile.wereda}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kebele</p>
                      <p className="font-medium">{clientInfo?.profile.kebele}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">House Number</p>
                      <p className="font-medium">{clientInfo?.profile.houseNumber}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Case Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/client/cases/new')}
                >
                  New Case
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Case Type</p>
                    <p className="font-medium">{clientInfo?.profile.caseType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Case Category</p>
                    <p className="font-medium">{clientInfo?.profile.caseCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Office ID</p>
                    <p className="font-medium">{clientInfo?.profile.officeId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={clientInfo?.user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                      {clientInfo?.user.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Cases</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/client/cases/new')}
              >
                New Case
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientInfo?.cases.map((case_) => (
                  <div key={case_.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{case_.title}</h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(case_.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={case_.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {case_.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/client/cases/${case_.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
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
              <CardTitle>My Documents</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/client/documents/upload')}
              >
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientInfo?.documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-gray-500">
                          Type: {doc.type} | Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={doc.status === 'APPROVED' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
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

        <TabsContent value="appointments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Appointments</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/client/appointments')}
              >
                Schedule Appointment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientInfo?.appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{appointment.purpose}</h3>
                        <p className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {new Date(appointment.scheduledTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={appointment.status === 'SCHEDULED' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/client/appointments/${appointment.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Messages</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/client/communication/messages')}
              >
                New Message
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientInfo?.messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{message.text}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {message.status === 'UNREAD' && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>My Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientInfo?.notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {notification.status === 'UNREAD' && (
                        <Badge variant="secondary">New</Badge>
                      )}
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
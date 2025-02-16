'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Calendar,
  BookOpen,
  Award,
  FileText,
  Users,
  TrendingUp,
  ArrowLeft,
  Plus,
  Check,
  UserPlus,
  Clock,
  MoreVertical,
  XCircle,
  MessageSquare,
  Eye
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import AssignCaseModal from '@/components/admin/lawyers/modals/AssignCaseModal';
import ViewProfileModal from '@/components/admin/lawyers/modals/ViewProfileModal';
import EditProfileModal from '@/components/admin/lawyers/modals/EditProfileModal';
import PermissionsModal from '@/components/admin/lawyers/modals/PermissionsModal';
import SuspendLawyerModal from '@/components/admin/lawyers/modals/SuspendLawyerModal';
import { toast } from 'react-hot-toast';

export default function LawyerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  // Mock data - replace with API call
  const lawyer = {
    id: params.id,
    name: 'Dr. Cherinet Hailu',
    title: 'Associate Professor',
    email: 'cherinet@dula.edu.et',
    phone: '+251911234567',
    avatar: '/avatars/01.png',
    specialization: 'Criminal Law',
    office: 'Main Campus',
    status: 'active',
    cases: {
      active: 24,
      completed: 156,
      success_rate: 92
    },
    rating: 4.8,
    experience: '8 years',
    education: [
      {
        degree: 'PhD in Criminal Law',
        institution: 'Addis Ababa University',
        year: 2018
      },
      {
        degree: 'LLM in Human Rights Law',
        institution: 'Dilla University',
        year: 2015
      }
    ],
    expertise: [
      'Criminal Defense',
      'Human Rights Law',
      'Constitutional Law',
      'Legal Research'
    ],
    workload: {
      current: 75,
      max: 100,
      teaching_hours: 12,
      research_projects: 2
    },
    performance: {
      case_resolution: 95,
      client_satisfaction: 90,
      documentation: 88,
      collaboration: 92
    }
  };

  const activeCases = [
    {
      id: '1',
      client: {
        name: 'Abebe Kebede',
        email: 'abebe@example.com',
        avatar: '/avatars/client1.png'
      },
      type: 'Criminal Defense',
      status: 'In Progress',
      dueDate: '2024-04-15',
      priority: 'High'
    },
    {
      id: '2',
      client: {
        name: 'Almaz Haile',
        email: 'almaz@example.com',
        avatar: '/avatars/client2.png'
      },
      type: 'Civil Litigation',
      status: 'Pending Review',
      dueDate: '2024-04-20',
      priority: 'Medium'
    },
    {
      id: '3',
      client: {
        name: 'Dawit Tadesse',
        email: 'dawit@example.com',
        avatar: '/avatars/client3.png'
      },
      type: 'Human Rights',
      status: 'In Progress',
      dueDate: '2024-04-25',
      priority: 'Low'
    }
  ];

  const caseHistory = [
    {
      id: '1',
      type: 'completed',
      title: 'Case Successfully Resolved',
      description: 'Criminal defense case concluded with favorable outcome',
      date: '2024-03-15'
    },
    {
      id: '2',
      type: 'assigned',
      title: 'New Case Assignment',
      description: 'Assigned to civil litigation case',
      date: '2024-03-10'
    },
    {
      id: '3',
      type: 'progress',
      title: 'Case Status Update',
      description: 'Filed motion for preliminary hearing',
      date: '2024-03-05'
    },
    {
      id: '4',
      type: 'completed',
      title: 'Case Documentation Completed',
      description: 'All required documents have been processed and filed',
      date: '2024-03-01'
    }
  ];

  const loadLawyerData = async () => {
    // Add API call to load lawyer data
    // For now using mock data
  };

  const handleUpdate = () => {
    // Refresh lawyer data
    loadLawyerData();
  };

  const handleSuspend = () => {
    // Refresh lawyer data and show success message
    loadLawyerData();
    toast.success('Lawyer has been suspended');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lawyers
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>Edit Profile</Button>
          <Button variant="outline" className="text-red-600" onClick={() => setShowSuspendModal(true)}>Suspend</Button>
        </div>
      </div>

      {/* Profile Overview */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={lawyer.avatar} />
              <AvatarFallback>{lawyer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{lawyer.name}</h1>
              <p className="text-muted-foreground">{lawyer.title}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-green-100 text-green-800">
                  {lawyer.status.charAt(0).toUpperCase() + lawyer.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{lawyer.rating}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Specialization: {lawyer.specialization}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Office: {lawyer.office}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Experience: {lawyer.experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Active Cases: {lawyer.cases.active}</span>
              </div>
            </div>
          </Card>

          {/* Education */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Education</h2>
            <div className="space-y-4">
              {lawyer.education.map((edu, index) => (
                <div key={index} className="flex items-start gap-4">
                  <BookOpen className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    <h3 className="font-medium">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}, {edu.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Expertise */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {lawyer.expertise.map((area, index) => (
                <Badge key={index} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Current Workload</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Case Load</span>
                  <span>{lawyer.workload.current}%</span>
                </div>
                <Progress value={lawyer.workload.current} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium">Teaching Hours</h3>
                  <p className="text-2xl font-bold mt-1">{lawyer.workload.teaching_hours}</p>
                  <p className="text-sm text-muted-foreground">hours per week</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium">Research Projects</h3>
                  <p className="text-2xl font-bold mt-1">{lawyer.workload.research_projects}</p>
                  <p className="text-sm text-muted-foreground">active projects</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              {Object.entries(lawyer.performance).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                    <span>{value}%</span>
                  </div>
                  <Progress value={value} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          {/* Case Statistics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Case Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Active Cases</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{lawyer.cases.active}</p>
                <p className="text-sm text-green-700 mt-1">Currently handling</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Completed Cases</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{lawyer.cases.completed}</p>
                <p className="text-sm text-blue-700 mt-1">Successfully resolved</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800">Success Rate</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{lawyer.cases.success_rate}%</p>
                <p className="text-sm text-yellow-700 mt-1">Overall performance</p>
              </div>
            </div>
          </Card>

          {/* Active Cases */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Active Cases</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={() => setShowAssignModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign New Case
                </Button>
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell>#{caseItem.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={caseItem.client.avatar} />
                            <AvatarFallback>{caseItem.client.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{caseItem.client.name}</div>
                            <div className="text-sm text-muted-foreground">{caseItem.client.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{caseItem.type}</TableCell>
                      <TableCell>
                        <Badge variant={caseItem.status === 'In Progress' ? 'default' : 'secondary'}>
                          {caseItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {format(new Date(caseItem.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            caseItem.priority === 'High' ? 'destructive' : 
                            caseItem.priority === 'Medium' ? 'warning' : 
                            'default'
                          }
                        >
                          {caseItem.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              View Documents
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Add Note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="w-4 h-4 mr-2" />
                              Remove Assignment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Case History */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Case History</h2>
            <div className="space-y-6">
              {caseHistory.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      item.type === 'completed' ? 'bg-green-100 text-green-600' :
                      item.type === 'assigned' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.type === 'completed' ? <Check className="w-5 h-5" /> :
                       item.type === 'assigned' ? <UserPlus className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AssignCaseModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        lawyerId={lawyer.id}
        lawyerName={lawyer.name}
      />

      <ViewProfileModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        lawyer={lawyer}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        lawyer={lawyer}
        onUpdate={handleUpdate}
      />

      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        lawyer={lawyer}
        onUpdate={handleUpdate}
      />

      <SuspendLawyerModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        lawyer={lawyer}
        onSuspend={handleSuspend}
      />
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineUserGroup, HiOutlineBriefcase, HiOutlineExclamationCircle, HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Case {
  id: string;
  title: string;
  category: string;
  type: string;
  priority: string;
  status: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  createdAt: string;
  description: string;
  clientRequest: string;
  kebele: string;
  wereda: string;
  isAssigned: boolean;
  assignmentDate?: string;
  assignmentHistory?: Array<{
    assigneeId: string;
    assigneeType: 'lawyer' | 'coordinator';
    assignedAt: string;
    unassignedAt?: string;
  }>;
  lawyer?: {
    id: string;
    fullName: string;
    phone?: string;
    email?: string;
    lawyerProfile?: {
      specializations: Array<{
        specialization: {
          name: string;
          category: string;
        };
      }>;
    };
  } | null;
  coordinator?: {
    id: string;
    fullName: string;
    phone?: string;
    email?: string;
    coordinatorProfile?: {
      type: string;
      office: {
        name: string;
        location: string;
      } | null;
    };
  } | null;
}

interface LawyerProfile {
  specializations: Array<{
    specialization: {
      name: string;
      category: string;
    };
    yearsExperience: number;
    isMainFocus: boolean;
  }>;
  caseLoad: number;
  availability: boolean;
  yearsOfPractice: number;
  rating: number | null;
  barAdmissionDate: string | null;
  primaryJurisdiction: string | null;
  languages: string[];
  certifications: string[];
  experience: number;
}

interface Lawyer {
  id: string;
  fullName: string;
  lawyerProfile?: LawyerProfile;
}

interface CoordinatorProfile {
  type: string;
  specialties: string[];
  status: string;
  startDate: string;
  endDate: string | null;
  office: {
    name: string;
    location: string;
  } | null;
  qualifications: Array<{
    name: string;
    issuer: string;
    dateObtained: string;
  }>;
}

interface Coordinator {
  id: string;
  fullName: string;
  coordinatorProfile: CoordinatorProfile;
}

export default function CaseAssignmentPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lawyers' | 'coordinators'>('lawyers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [selectedCaseData, setSelectedCaseData] = useState<Case | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [notificationMethod, setNotificationMethod] = useState<'sms' | 'email' | 'web' | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsMessage, setSMSMessage] = useState('');
  const [sendingSMS, setSendingSMS] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/cases/assign', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setCases(data.data.cases);
      setLawyers(data.data.lawyers);
      setCoordinators(data.data.coordinators);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const validateAssignment = (case_: Case, assigneeId: string, assigneeType: 'lawyer' | 'coordinator'): boolean => {
    if (case_.isAssigned) {
      toast.error('This case is already assigned');
      return false;
    }

    if (assigneeType === 'lawyer') {
      const lawyer = lawyers.find(l => l.id === assigneeId);
      if (!lawyer) {
        toast.error('Selected lawyer not found');
        return false;
      }
      if (!lawyer.lawyerProfile) {
        toast.error('Lawyer profile not found');
        return false;
      }
      if (!lawyer.lawyerProfile.availability) {
        toast.error('Selected lawyer is not available');
        return false;
      }
    } else {
      const coordinator = coordinators.find(c => c.id === assigneeId);
      if (!coordinator) {
        toast.error('Selected coordinator not found');
        return false;
      }
      if (coordinator.coordinatorProfile.status !== 'ACTIVE') {
        toast.error('Selected coordinator is not active');
        return false;
      }
    }

    return true;
  };

  const sendSMSNotification = async (case_: Case, assigneeId: string, assigneeType: 'lawyer' | 'coordinator') => {
    try {
      setNotificationLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caseId: case_.id,
          assigneeId,
          assigneeType,
          message: smsMessage || `New case assignment: ${case_.title}. Please check your dashboard for details.`
        })
      });

      if (!response.ok) throw new Error('Failed to send SMS notification');
      toast.success('SMS notification sent successfully');
      setShowSMSModal(false);
      setShowNotificationModal(false);
      fetchData();
      setSelectedCase(null);
      setSelectedAssignee(null);
      setAssignmentNotes('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Failed to send SMS notification');
    } finally {
      setNotificationLoading(false);
    }
  };

  const sendEmailNotification = async (case_: Case, assigneeId: string, assigneeType: 'lawyer' | 'coordinator') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caseId: case_.id,
          assigneeId,
          assigneeType,
          subject: 'New Case Assignment',
          message: `You have been assigned to case: ${case_.title}`
        })
      });

      if (!response.ok) throw new Error('Failed to send email notification');
      toast.success('Email notification sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email notification');
    }
  };

  const sendWebNotification = async (case_: Case, assigneeId: string, assigneeType: 'lawyer' | 'coordinator') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/web', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caseId: case_.id,
          assigneeId,
          assigneeType,
          title: 'New Case Assignment',
          message: `You have been assigned to case: ${case_.title}`
        })
      });

      if (!response.ok) throw new Error('Failed to send web notification');
      toast.success('Web notification sent successfully');
    } catch (error) {
      console.error('Error sending web notification:', error);
      toast.error('Failed to send web notification');
    }
  };

  const handleAssign = async () => {
    if (!selectedCase || !selectedAssignee) return;

    const case_ = cases.find(c => c.id === selectedCase);
    if (!case_) return;

    if (!validateAssignment(case_, selectedAssignee, activeTab === 'lawyers' ? 'lawyer' : 'coordinator')) {
      return;
    }

    setAssignmentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/cases/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caseId: selectedCase,
          assigneeId: selectedAssignee,
          assigneeType: activeTab === 'lawyers' ? 'lawyer' : 'coordinator',
          notes: assignmentNotes
        })
      });

      if (!response.ok) throw new Error('Failed to assign case');

      toast.success('Case assigned successfully');
      setShowNotificationModal(true);
    } catch (error) {
      console.error('Error assigning case:', error);
      toast.error('Failed to assign case');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleUnassign = async (caseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/cases/unassign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ caseId })
      });

      if (!response.ok) throw new Error('Failed to unassign case');

      toast.success('Case unassigned successfully');
      fetchData(); // Refresh data
      setShowUnassignConfirm(false);
    } catch (error) {
      console.error('Error unassigning case:', error);
      toast.error('Failed to unassign case');
    }
  };

  const handleCaseClick = (case_: Case) => {
    setSelectedCase(case_.id);
    setSelectedCaseData(case_);
    setShowCaseDetails(true);
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = 
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || case_.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredAssignees = activeTab === 'lawyers'
    ? lawyers.filter(lawyer => {
        const matchesSearch = lawyer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lawyer.lawyerProfile?.specializations.some(spec => 
            spec.specialization.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            spec.specialization.category.toLowerCase().includes(searchTerm.toLowerCase())
          );
        
        const matchesCategory = categoryFilter === 'all' || 
          lawyer.lawyerProfile?.specializations.some(spec => 
            spec.specialization.category === categoryFilter
          );

        const matchesType = !selectedCaseData || typeFilter === 'all' || 
          lawyer.lawyerProfile?.specializations.some(spec => 
            spec.specialization.name === selectedCaseData.type
          );

        return matchesSearch && matchesCategory && matchesType;
      })
    : coordinators.filter(coordinator => {
        const matchesSearch = coordinator.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || coordinator.coordinatorProfile.type === typeFilter;
        return matchesSearch && matchesType;
      });

  const handleSendSMS = async (caseId: string, recipientId: string, recipientType: 'lawyer' | 'coordinator') => {
    try {
      setSendingSMS(true);
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          recipientId,
          recipientType,
          message: smsMessage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      toast.success('SMS sent successfully');
      setShowSMSModal(false);
      setSMSMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Failed to send SMS');
    } finally {
      setSendingSMS(false);
    }
  };

  const generateSMSTemplate = (caseData: Case) => {
    if (!caseData) return '';
    
    return `Case Assignment Notification:
----------------------------------------
Case Details:
- Title: ${caseData.title}
- ID: ${caseData.id.slice(-8)}
- Category: ${caseData.category}
- Type: ${caseData.type}
- Priority: ${caseData.priority}
----------------------------------------
Client Information:
- Name: ${caseData.clientName}
- Location: ${caseData.wereda}, ${caseData.kebele}
----------------------------------------
Assignment Details:
${caseData.lawyer ? `- Assigned Lawyer: ${caseData.lawyer.fullName}
- Assignment Date: ${format(new Date(caseData.assignmentDate || ''), 'MMM d, yyyy')}` : '- Not yet assigned'}
----------------------------------------
Case Description:
${caseData.description}

Please review the case details and respond to confirm receipt.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Case Assignment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Assign cases to lawyers and coordinators based on their expertise and availability
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search cases, lawyers, or coordinators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            </div>

            {/* Type Filter for Coordinators */}
            {activeTab === 'coordinators' && (
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                    ${typeFilter === 'all'
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setTypeFilter('PERMANENT')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                    ${typeFilter === 'PERMANENT'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  Permanent
                </button>
                <button
                  onClick={() => setTypeFilter('PROJECT')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                    ${typeFilter === 'PROJECT'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  Project Based
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                ${statusFilter === 'all'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              All Cases
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                ${statusFilter === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                ${statusFilter === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                ${statusFilter === 'RESOLVED'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Resolved
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                ${categoryFilter === 'all'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setCategoryFilter('CRIMINAL')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                ${categoryFilter === 'CRIMINAL'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Criminal Law
            </button>
            <button
              onClick={() => setCategoryFilter('CIVIL')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                ${categoryFilter === 'CIVIL'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Civil Law
            </button>
            <button
              onClick={() => setCategoryFilter('FAMILY')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150
                ${categoryFilter === 'FAMILY'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Family Law
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cases Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pending Cases
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredCases.length} cases found
                </div>
              </div>
              <div className="overflow-x-auto">
                {filteredCases.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Case Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category/Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Priority/Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Client/Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Assignments
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredCases.map((case_) => (
                        <tr
                          key={case_.id}
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                            selectedCase === case_.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {case_.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {case_.id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Created: {format(new Date(case_.createdAt), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                                {case_.category}
                              </span>
                              {case_.type && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                                    {case_.type}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${case_.priority === 'HIGH'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                  : case_.priority === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                }`}
                              >
                                {case_.priority}
                              </span>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${case_.status === 'ACTIVE'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                    : case_.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                    : case_.status === 'RESOLVED'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                                  }`}
                                >
                                  {case_.status}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {case_.clientName}
                              </div>
                              {case_.kebele && case_.wereda && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {case_.wereda}, {case_.kebele}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {case_.lawyer ? (
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-900 dark:text-white flex items-center justify-between">
                                    <span>Assigned to: {case_.lawyer.fullName}</span>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/admin/cases/${case_.id}`);
                                        }}
                                        className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                                      >
                                        View Details
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedCase(case_.id);
                                          setShowUnassignConfirm(true);
                                        }}
                                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                      >
                                        Unassign
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Assigned on: {format(new Date(case_.assignmentDate || ''), 'MMM d, yyyy')}
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCase(case_.id);
                                        setShowSMSModal(true);
                                      }}
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200"
                                    >
                                      Send SMS
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        sendEmailNotification(null, case_.lawyer.id, 'lawyer');
                                      }}
                                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200"
                                    >
                                      Send Email
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        sendWebNotification(null, case_.lawyer.id, 'lawyer');
                                      }}
                                      className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200"
                                    >
                                      Send Web
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Not assigned
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No cases found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assignees Section */}
          <div className="space-y-6">
            {/* Case Details Card (when selected) */}
            {selectedCaseData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Selected Case Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                    <p className="text-gray-900 dark:text-white">{selectedCaseData.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                    <p className="text-gray-900 dark:text-white">{selectedCaseData.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Request</label>
                    <p className="text-gray-900 dark:text-white">{selectedCaseData.clientRequest}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Assignee Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setActiveTab('lawyers')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'lawyers'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <HiOutlineBriefcase className="h-5 w-5 mr-2" />
                    Lawyers
                  </button>
                  <button
                    onClick={() => setActiveTab('coordinators')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'coordinators'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <HiOutlineUserGroup className="h-5 w-5 mr-2" />
                    Coordinators
                  </button>
                </div>

                {/* Assignees Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type/Office
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredAssignees.map((person) => (
                        <tr
                          key={person.id}
                          className={`${
                            selectedAssignee === person.id
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {person.fullName}
                            </div>
                            {activeTab === 'lawyers' && (
                              <div className="text-xs text-gray-500">
                                {(person as Lawyer).lawyerProfile?.yearsOfPractice} years experience
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {activeTab === 'lawyers' ? (
                                <div>
                                  {(person as Lawyer).lawyerProfile?.specializations.map((spec, index) => (
                                    <div key={index} className="mb-1">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 mr-1">
                                        {spec.specialization.category}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {spec.specialization.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div>
                                  <div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${(person as Coordinator).coordinatorProfile.type === 'PERMANENT'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                      }`}
                                    >
                                      {(person as Coordinator).coordinatorProfile.type}
                                    </span>
                                  </div>
                                  {(person as Coordinator).coordinatorProfile.office && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      {(person as Coordinator).coordinatorProfile.office.name} - {(person as Coordinator).coordinatorProfile.office.location}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900 dark:text-white">
                                {activeTab === 'lawyers'
                                  ? `${(person as Lawyer).lawyerProfile?.caseLoad} cases`
                                  : `${(person as Coordinator).coordinatorProfile.specialties.length} specialties`}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                ${(activeTab === 'lawyers'
                                  ? (person as Lawyer).lawyerProfile?.availability
                                  : (person as Coordinator).coordinatorProfile.status === 'ACTIVE')
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}
                              >
                                {(activeTab === 'lawyers'
                                  ? (person as Lawyer).lawyerProfile?.availability
                                  : (person as Coordinator).coordinatorProfile.status === 'ACTIVE')
                                  ? 'Available'
                                  : 'Busy'}
                              </span>
                              {activeTab === 'lawyers' && (person as Lawyer).lawyerProfile?.caseLoad > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/admin/cases?lawyer=${person.id}`);
                                  }}
                                  className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                  View Cases
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {activeTab === 'lawyers' && (person as Lawyer).lawyerProfile?.caseLoad > 0 ? (
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-900 dark:text-white">
                                      {(person as Lawyer).lawyerProfile?.caseLoad} active cases
                                    </span>
                                    <button
                                      onClick={() => router.push(`/admin/cases?lawyer=${person.id}`)}
                                      className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                                    >
                                      View Cases
                                    </button>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        setSelectedAssignee(person.id);
                                        setShowSMSModal(true);
                                      }}
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200"
                                      disabled={!(person as Lawyer).lawyerProfile?.availability}
                                    >
                                      Send SMS
                                    </button>
                                    <button
                                      onClick={() => sendEmailNotification(null, person.id, 'lawyer')}
                                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200"
                                      disabled={!(person as Lawyer).lawyerProfile?.availability}
                                    >
                                      Send Email
                                    </button>
                                    <button
                                      onClick={() => sendWebNotification(null, person.id, 'lawyer')}
                                      className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200"
                                      disabled={!(person as Lawyer).lawyerProfile?.availability}
                                    >
                                      Send Web
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSelectedAssignee(person.id)}
                                  className={`px-3 py-1 rounded-md ${
                                    selectedAssignee === person.id
                                      ? 'bg-primary-600 text-white'
                                      : 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                  }`}
                                  disabled={!(person as Lawyer).lawyerProfile?.availability}
                                >
                                  Select
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Action */}
        {selectedCase && selectedAssignee && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assignment Notes
            </h3>
            <textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="Add any notes about this assignment..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 mb-4"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                onClick={handleAssign}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Send Assignment Notification
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose how to notify the assignee about this case:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSMSModal(true);
                  setShowNotificationModal(false);
                  const case_ = cases.find(c => c.id === selectedCase);
                  if (case_) {
                    const assignee = activeTab === 'lawyers' 
                      ? lawyers.find(l => l.id === selectedAssignee)
                      : coordinators.find(c => c.id === selectedAssignee);
                    setSMSMessage(
                      `Dear ${assignee?.fullName},\n\nYou have been assigned to a new case:\n` +
                      `Case Title: ${case_.title}\n` +
                      `Case Type: ${case_.type}\n` +
                      `Priority: ${case_.priority}\n\n` +
                      `Please review the case details and take necessary action.`
                    );
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send SMS
              </button>
              <button
                onClick={async () => {
                  const case_ = cases.find(c => c.id === selectedCase);
                  if (case_ && selectedAssignee) {
                    await sendEmailNotification(case_, selectedAssignee, activeTab === 'lawyers' ? 'lawyer' : 'coordinator');
                    setShowNotificationModal(false);
                    fetchData();
                    setSelectedCase(null);
                    setSelectedAssignee(null);
                    setAssignmentNotes('');
                  }
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Email
              </button>
              <button
                onClick={async () => {
                  const case_ = cases.find(c => c.id === selectedCase);
                  if (case_ && selectedAssignee) {
                    await sendWebNotification(case_, selectedAssignee, activeTab === 'lawyers' ? 'lawyer' : 'coordinator');
                    setShowNotificationModal(false);
                    fetchData();
                    setSelectedCase(null);
                    setSelectedAssignee(null);
                    setAssignmentNotes('');
                  }
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Send Web Notification
              </button>
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  fetchData();
                  setSelectedCase(null);
                  setSelectedAssignee(null);
                  setAssignmentNotes('');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Skip Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unassign Confirmation Modal */}
      {showUnassignConfirm && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Unassignment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to unassign this case? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUnassignConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnassign(selectedCase)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Unassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {showSMSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send SMS Notification
              </h3>
              <button
                onClick={() => {
                  setShowSMSModal(false);
                  setSMSMessage('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {selectedCase && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Case Details</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-medium">Title:</span> {cases.find(c => c.id === selectedCase)?.title}</p>
                    <p><span className="font-medium">Category:</span> {cases.find(c => c.id === selectedCase)?.category}</p>
                    <p><span className="font-medium">Type:</span> {cases.find(c => c.id === selectedCase)?.type}</p>
                    <p><span className="font-medium">Priority:</span> {cases.find(c => c.id === selectedCase)?.priority}</p>
                    <p><span className="font-medium">Status:</span> {cases.find(c => c.id === selectedCase)?.status}</p>
                    <p><span className="font-medium">Description:</span> {cases.find(c => c.id === selectedCase)?.description}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Client Information</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-medium">Name:</span> {cases.find(c => c.id === selectedCase)?.clientName}</p>
                    <p><span className="font-medium">Phone:</span> {cases.find(c => c.id === selectedCase)?.clientPhone}</p>
                    <p><span className="font-medium">Email:</span> {cases.find(c => c.id === selectedCase)?.clientEmail}</p>
                    <p><span className="font-medium">Location:</span> {cases.find(c => c.id === selectedCase)?.wereda}, {cases.find(c => c.id === selectedCase)?.kebele}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="smsMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <button
                  onClick={() => {
                    const selectedCaseData = cases.find(c => c.id === selectedCase);
                    if (selectedCaseData) {
                      const template = generateSMSTemplate(selectedCaseData);
                      setSMSMessage(template);
                    }
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Use Template
                </button>
              </div>
              <textarea
                id="smsMessage"
                value={smsMessage}
                onChange={(e) => setSMSMessage(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your message here..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSMSModal(false);
                  setSMSMessage('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const selectedCaseData = cases.find(c => c.id === selectedCase);
                  if (selectedCaseData?.lawyer) {
                    handleSendSMS(selectedCase, selectedCaseData.lawyer.id, 'lawyer');
                  }
                }}
                disabled={!smsMessage.trim() || sendingSMS}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingSMS ? 'Sending...' : 'Send SMS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
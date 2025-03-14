"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CaseStatus, OfficeType, UserStatus } from '@prisma/client';
import {
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineScale,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineStar,
  HiOutlineExclamation,
  HiOutlineCalendar
} from 'react-icons/hi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: string;
  category: string;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  assignedLawyer?: {
    id: string;
    fullName: string;
    email: string;
    lawyerProfile: {
      office: {
        name: string;
    };
  specializations: Array<{
    specialization: {
      name: string;
        };
      }>;
    };
  };
  assignedOffice?: {
    id: string;
        name: string;
  };
  createdAt: string;
}

interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  office: string;
  specializations: string[];
  currentCaseload: number;
  availability: boolean;
}

interface Office {
  id: string;
    name: string;
}

interface Specialization {
  id: string;
  name: string;
  category: string;
}

export default function CaseAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [filters, setFilters] = useState({
    office: '',
    specialization: '',
    status: '',
    search: ''
  });
  const [showTips, setShowTips] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load data with filters
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please log in to continue');
        router.push('/auth/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.office) params.append('office', filters.office);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/cases/assign?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      if (data.success) {
      setCases(data.data.cases);
      setLawyers(data.data.lawyers);
        setOffices(data.data.offices);
        setSpecializations(data.data.specializations);
    } else {
        toast.error(data.message || 'Failed to load data');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCase || !selectedLawyer) {
      toast.error('Please select both a case and a lawyer');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Please log in to continue');
        router.push('/auth/login');
      return;
    }

      const response = await fetch('/api/cases/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          caseId: selectedCase.id,
          lawyerId: selectedLawyer.id,
          notes: assignmentNotes
        })
      });

      const data = await response.json();
      if (data.success) {
      toast.success('Case assigned successfully');
        setShowAssignDialog(false);
        setSelectedCase(null);
        setSelectedLawyer(null);
        setAssignmentNotes('');
        loadData();
      } else {
        toast.error(data.message || 'Failed to assign case');
      }
    } catch (error) {
      console.error('Error assigning case:', error);
      toast.error('Failed to assign case');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case CaseStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case CaseStatus.RESOLVED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortCases = (casesToSort: Case[]) => {
    return [...casesToSort].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return sortOrder === 'desc' 
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return sortOrder === 'desc'
            ? priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
            : priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        default:
          return 0;
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'text-red-600 dark:text-red-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getWorkloadIndicator = (caseload: number) => {
    if (caseload < 3) return { color: 'text-green-500', text: 'Light' };
    if (caseload < 6) return { color: 'text-yellow-500', text: 'Moderate' };
    return { color: 'text-red-500', text: 'Heavy' };
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header with Tips Button */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Case Assignment
          </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTips(!showTips)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <HiOutlineStar className="w-5 h-5" />
              </Button>
            </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
              Assign cases to available lawyers based on their expertise and workload
          </p>
        </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={loadData}
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <HiOutlineRefresh className="w-4 h-4" />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
            </div>

        {/* Tips Section */}
        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
            >
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                <HiOutlineStar className="w-5 h-5" />
                Quick Tips for Case Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-start gap-2">
                  <HiOutlineCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>Consider lawyer's current workload and specialization when assigning cases</p>
              </div>
                <div className="flex items-start gap-2">
                  <HiOutlineCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>Priority cases should be assigned to lawyers with lighter workloads</p>
          </div>
                <div className="flex items-start gap-2">
                  <HiOutlineCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>Check lawyer's office location relative to the case requirements</p>
          </div>
                <div className="flex items-start gap-2">
                  <HiOutlineCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>Add detailed notes to help with case tracking and handover</p>
          </div>
        </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <HiOutlineDocumentText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unassigned Cases</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{cases.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {cases.filter(c => c.priority === 'HIGH').length} high priority
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <HiOutlineUserGroup className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
                            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Lawyers</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{lawyers.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {lawyers.filter(l => l.currentCaseload < 3).length} with light workload
                </p>
                              </div>
                              </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <HiOutlineScale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                              </div>
                            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Workload</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {lawyers.length ? Math.round(lawyers.reduce((acc, l) => acc + l.currentCaseload, 0) / lawyers.length) : 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">cases per lawyer</p>
                                </div>
                            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <HiOutlineChartBar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                              </div>
                            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Case Distribution</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Object.keys(cases.reduce((acc, c) => ({ ...acc, [c.category]: true }), {})).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">unique categories</p>
                              </div>
                                </div>
          </motion.div>
                            </div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HiOutlineFilter className="w-5 h-5" />
              Filter & Sort
            </h3>
            <div className="flex items-center gap-3">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
                                    </div>
                                  </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search cases or lawyers..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
                                  </div>
            <Select
              value={filters.office}
              onValueChange={(value) => handleFilterChange('office', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Office" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offices</SelectItem>
                {offices.map(office => (
                  <SelectItem key={office.id} value={office.id}>{office.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.specialization}
              onValueChange={(value) => handleFilterChange('specialization', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec.id} value={spec.id}>{spec.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CaseStatus).map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
                                  </div>
        </motion.div>

        {/* Enhanced Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enhanced Cases List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <HiOutlineDocumentText className="w-5 h-5" />
                  Unassigned Cases
                </h2>
                                </div>
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {sortCases(cases).map(case_ => (
                  <motion.div
                    key={case_.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedCase?.id === case_.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-blue-200 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedCase(case_)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{case_.title}</h3>
                          {case_.priority === 'HIGH' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HiOutlineExclamation className="w-5 h-5 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>High Priority Case</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                              )}
                            </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <HiOutlineUser className="w-4 h-4" />
                          <span>{case_.client.fullName}</span>
                  </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                          <HiOutlineCalendar className="w-4 h-4" />
                          <span>{new Date(case_.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
                      <Badge className={getStatusColor(case_.status)}>
                        {case_.status}
                      </Badge>
          </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1">
                        <HiOutlineScale className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{case_.category}</span>
                  </div>
                      <div className="flex items-center gap-1">
                        <HiOutlineClock className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm ${getPriorityColor(case_.priority)}`}>{case_.priority}</span>
                  </div>
                  </div>
                  </motion.div>
                ))}
                </div>
            </Card>
          </motion.div>

          {/* Enhanced Lawyers List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <HiOutlineUserGroup className="w-5 h-5" />
                  Available Lawyers
                </h2>
                </div>
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {lawyers.map(lawyer => {
                  const workload = getWorkloadIndicator(lawyer.currentCaseload);
                  return (
                    <motion.div
                      key={lawyer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedLawyer?.id === lawyer.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 hover:border-green-200 dark:border-gray-700'
                      }`}
                      onClick={() => setSelectedLawyer(lawyer)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{lawyer.fullName}</h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <HiOutlineOfficeBuilding className="w-4 h-4" />
                            <span>{lawyer.office}</span>
                            </div>
                              </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={lawyer.availability ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}>
                            {lawyer.currentCaseload} cases
                          </Badge>
                          <span className={`text-xs ${workload.color}`}>
                            {workload.text} workload
                                      </span>
                                    </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                          {lawyer.specializations.map(spec => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                                  ))}
                                </div>
                                  </div>
                    </motion.div>
                  );
                })}
                                    </div>
            </Card>
          </motion.div>
                                </div>

        {/* Enhanced Assignment Button */}
        <div
          className="flex justify-end"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowAssignDialog(true)}
                  disabled={!selectedCase || !selectedLawyer}
                  className="gap-2"
                >
                  <HiOutlineBriefcase className="w-4 h-4" />
                  Assign Case
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{!selectedCase || !selectedLawyer ? "Select both a case and a lawyer to enable assignment" : "Assign selected case to lawyer"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
                            </div>

        {/* Enhanced Assignment Dialog */}
        <Dialog
          open={showAssignDialog}
          onOpenChange={(open) => setShowAssignDialog(open)}
        >
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
                <DialogTitle className="text-2xl font-semibold text-white flex items-center gap-3 m-0">
                  <HiOutlineBriefcase className="w-6 h-6" />
                  Confirm Case Assignment
                </DialogTitle>
                <p className="text-blue-100 mt-2">Review and confirm the case assignment details</p>
                                  </div>

              {selectedCase && selectedLawyer && (
                <div className="p-6 space-y-6">
                  {/* Case Details Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600"
                  >
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-3">
                      <HiOutlineDocumentText className="w-4 h-4" />
                      Case Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCase.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCase.description}</p>
                            </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                            <HiOutlineUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedCase.client.fullName}</p>
              </div>
            </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                            <HiOutlineClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Priority</p>
                            <p className={`text-sm font-medium ${getPriorityColor(selectedCase.priority)}`}>
                              {selectedCase.priority} Priority
                            </p>
        </div>
            </div>
          </div>
      </div>
                  </motion.div>

                  {/* Lawyer Details Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600"
                  >
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-3">
                      <HiOutlineUserGroup className="w-4 h-4" />
                      Lawyer Details
            </h3>
            <div className="space-y-3">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedLawyer.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedLawyer.email}</p>
            </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                            <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Office</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLawyer.office}</p>
        </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                            <HiOutlineBriefcase className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Current Workload</p>
                            <p className={`text-sm font-medium ${getWorkloadIndicator(selectedLawyer.currentCaseload).color}`}>
                              {selectedLawyer.currentCaseload} cases
                            </p>
            </div>
          </div>
        </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLawyer.specializations.map(spec => (
                            <Badge
                              key={spec}
                              variant="outline"
                              className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-0"
                            >
                              {spec}
                            </Badge>
                          ))}
            </div>
                  </div>
                </div>
                  </motion.div>

                  {/* Assignment Notes */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assignment Notes
                    </label>
              <textarea
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      placeholder="Add any relevant notes about this assignment..."
                    />
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setShowAssignDialog(false)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
                    </Button>
                    <Button
                      onClick={handleAssign}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <HiOutlineCheck className="w-4 h-4" />
                          Confirm Assignment
                        </>
                      )}
                    </Button>
                  </motion.div>
        </div>
      )}
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 
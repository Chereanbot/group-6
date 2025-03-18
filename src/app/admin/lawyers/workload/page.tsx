"use client";

import { useState, useEffect, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  StopIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  StarIcon,
  EllipsisVerticalIcon as DotsVerticalIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  status: string;
  phoneNumber: string;
  lastActive: string | null;
  office: string;
  officeLocation: string;
  experience: number;
  specializations: string[];
  totalCases: number;
  activeCases: number;
  last30DaysCases: number;
  last60DaysCases: number;
  last90DaysCases: number;
  highPriorityCases: number;
  recentCases: number;
  completedCases: number;
  activeAssignments: number;
  completedAssignments: number;
  rating: number;
  caseLoad: number;
  utilizationRate: number;
  efficiency: number;
  avgResponseTime: number;
  yearsOfPractice: number;
  barAdmissionDate: string | null;
  languages: string[];
  certifications: string[];
  lastUpdatedAt: string | null;
  needsUpdate: boolean;
  daysUntilUpdate: number;
}

interface WorkloadStats {
  averageWorkload: number;
  maxWorkload: number;
  minWorkload: number;
  overloadedLawyers: number;
  underutilizedLawyers: number;
  totalCases: number;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Add the function outside the component
const calculateDaysUntilUpdate = (lastUpdatedAt: string | null): number => {
  if (!lastUpdatedAt) return 0;
  
  const lastUpdate = new Date(lastUpdatedAt);
  const now = new Date();
  const nextUpdate = new Date(lastUpdate);
  nextUpdate.setDate(nextUpdate.getDate() + 30);
  
  const daysLeft = Math.ceil((nextUpdate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
};

export default function LawyerWorkloadPage() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkloadStats>({
    averageWorkload: 0,
    maxWorkload: 0,
    minWorkload: 0,
    overloadedLawyers: 0,
    underutilizedLawyers: 0,
    totalCases: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'caseLoad',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({
    office: 'all',
    workloadLevel: 'all',
    searchTerm: ''
  });
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<number>(30);
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout>();
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/lawyers/workload');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch workload data');
      }

      const { data } = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }

      // Add daysUntilUpdate to each lawyer
      const enrichedData = data.map(lawyer => ({
        ...lawyer,
        daysUntilUpdate: calculateDaysUntilUpdate(lawyer.lastUpdatedAt)
      }));

      setLawyers(enrichedData);

      // Calculate stats
      const workloads = enrichedData.map(l => l.caseLoad);
      const totalCases = enrichedData.reduce((sum, l) => sum + l.caseCount, 0);
      const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;

      setStats({
        averageWorkload: avgWorkload,
        maxWorkload: Math.max(...workloads),
        minWorkload: Math.min(...workloads),
        overloadedLawyers: enrichedData.filter(l => l.utilizationRate > 80).length,
        underutilizedLawyers: enrichedData.filter(l => l.utilizationRate < 40).length,
        totalCases
      });

    } catch (error) {
      console.error('Error loading workload data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load workload data');
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (autoUpdateEnabled) {
      // Start countdown
      const interval = setInterval(() => {
        setTimeUntilNextUpdate((prev) => {
          if (prev <= 1) {
            loadData();
            return 30;
          }
          return prev - 1;
        });
      }, 1000 * 60 * 60 * 24); // Update every day

      autoUpdateIntervalRef.current = interval;
      return () => clearInterval(interval);
    } else if (autoUpdateIntervalRef.current) {
      clearInterval(autoUpdateIntervalRef.current);
    }
  }, [autoUpdateEnabled]);

  const toggleAutoUpdate = () => {
    setAutoUpdateEnabled(!autoUpdateEnabled);
    if (!autoUpdateEnabled) {
      setTimeUntilNextUpdate(30);
      loadData();
    }
  };

  const getWorkloadLevel = (caseLoad: number) => {
    const avg = stats.averageWorkload;
    if (caseLoad > avg * 1.2) return 'High';
    if (caseLoad < avg * 0.8) return 'Low';
    return 'Normal';
  };

  const getWorkloadColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  const filteredAndSortedLawyers = lawyers
    .filter(lawyer => {
      const matchesSearch = lawyer.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        lawyer.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesOffice = filters.office === 'all' || lawyer.office === filters.office;
      const workloadLevel = getWorkloadLevel(lawyer.caseLoad);
      const matchesWorkload = filters.workloadLevel === 'all' || workloadLevel.toLowerCase() === filters.workloadLevel.toLowerCase();
      
      return matchesSearch && matchesOffice && matchesWorkload;
    })
    .sort((a, b) => {
      const aValue = sortConfig.key === 'caseLoad' ? a.caseLoad : a.rating;
      const bValue = sortConfig.key === 'caseLoad' ? b.caseLoad : b.rating;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const offices = Array.from(new Set(lawyers.map(l => l.office)));

  // Add new helper functions
  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Not set';
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return 'Invalid date';
      }
      return format(parsedDate, 'MMM d, yyyy');
    } catch (error) {
      console.error('Invalid date:', date);
      return 'Invalid date';
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return phone || 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateTimeRemaining = (targetDate: Date): CountdownTime => {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    
    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
  };

  useEffect(() => {
    if (autoUpdateEnabled) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + timeUntilNextUpdate);
      
      const timer = setInterval(() => {
        const timeRemaining = calculateTimeRemaining(targetDate);
        
        if (timeRemaining.days <= 0 && 
            timeRemaining.hours <= 0 && 
            timeRemaining.minutes <= 0 && 
            timeRemaining.seconds <= 0) {
          loadData();
          targetDate.setDate(targetDate.getDate() + 30);
        }
        
        setCountdown(timeRemaining);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoUpdateEnabled, timeUntilNextUpdate]);

  const formatCountdown = (time: CountdownTime): string => {
    return `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Lawyer Workload Management</h1>
          <p className="text-gray-500">Monitor and balance case distribution among lawyers</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAutoUpdate}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              autoUpdateEnabled
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
          >
            {autoUpdateEnabled ? (
              <>
                <StopIcon className="w-5 h-5" />
                Stop Auto-Update
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Start Auto-Update
              </>
            )}
          </button>
          {autoUpdateEnabled && (
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-600">
                Next update in:
              </span>
              <span className="text-lg font-bold text-gray-800">
                {formatCountdown(countdown)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Workload</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageWorkload.toFixed(1)} cases</div>
            <p className="text-xs text-muted-foreground">per lawyer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workload Distribution</CardTitle>
            <ChartPieIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overloadedLawyers}</div>
            <p className="text-xs text-red-500">Overloaded lawyers</p>
            <div className="text-2xl font-bold mt-2">{stats.underutilizedLawyers}</div>
            <p className="text-xs text-yellow-500">Underutilized lawyers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workload Range</CardTitle>
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm">Min: <span className="font-bold">{stats.minWorkload}</span></p>
              <p className="text-sm">Max: <span className="font-bold">{stats.maxWorkload}</span></p>
              <p className="text-sm">Total: <span className="font-bold">{stats.totalCases}</span> cases</p>
        </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search lawyers..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>
        <Select
          value={filters.office}
          onValueChange={(value) => setFilters({ ...filters, office: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {offices.map((office) => (
              <SelectItem key={office} value={office}>{office}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.workloadLevel}
          onValueChange={(value) => setFilters({ ...filters, workloadLevel: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by workload" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High Workload</SelectItem>
            <SelectItem value="normal">Normal Workload</SelectItem>
            <SelectItem value="low">Low Workload</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lawyer</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Specializations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cases</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('caseLoad')}
              >
                Workload {sortConfig.key === 'caseLoad' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('rating')}
              >
                Performance {sortConfig.key === 'rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Next Update</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAndSortedLawyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No lawyers found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedLawyers.map((lawyer) => {
                const workloadLevel = getWorkloadLevel(lawyer.caseLoad);
                const workloadPercentage = (lawyer.caseLoad / stats.maxWorkload) * 100;
                
                return (
                  <TableRow 
                    key={lawyer.id}
                    className={lawyer.daysUntilUpdate <= 5 ? "bg-yellow-50" : ""}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{lawyer.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {lawyer.yearsOfPractice} years of practice
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bar admission: {formatDate(lawyer.barAdmissionDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <EnvelopeIcon className="h-4 w-4" />
                          {lawyer.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <PhoneIcon className="h-4 w-4" />
                          {formatPhoneNumber(lawyer.phoneNumber)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon className="h-3 w-3" />
                          Last active: {formatDate(lawyer.lastActive)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{lawyer.office}</div>
                        <div className="text-xs text-muted-foreground">{lawyer.officeLocation}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lawyer.status)}>
                        {lawyer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>{lawyer.activeCases} active</span>
                        </div>
                        {lawyer.highPriorityCases > 0 && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>{lawyer.highPriorityCases} high priority</span>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {lawyer.completedCases} completed
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge className={getWorkloadColor(workloadLevel)}>
                          {workloadLevel}
                        </Badge>
                        <div className="w-full">
                          <Progress value={workloadPercentage} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {workloadPercentage.toFixed(1)}% of max
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{(lawyer.rating ?? 0).toFixed(1)}</span>
                          <span className="text-muted-foreground">/5.0</span>
                        </div>
                        <div className="text-xs">
                          Efficiency: {lawyer.efficiency.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg response: {lawyer.avgResponseTime.toFixed(1)} days
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(lawyer.lastUpdatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lawyer.needsUpdate ? (
                          <Badge variant="destructive" className="bg-yellow-500">
                            Update Required
                          </Badge>
                        ) : (
                          <>
                            <div className="text-sm font-medium">
                              {lawyer.daysUntilUpdate}d {Math.floor((lawyer.daysUntilUpdate % 1) * 24)}h
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  lawyer.daysUntilUpdate <= 5
                                    ? "bg-yellow-500"
                                    : lawyer.daysUntilUpdate <= 10
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (lawyer.daysUntilUpdate / 30) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="text-xs text-gray-500">
                              {((lawyer.daysUntilUpdate / 30) * 100).toFixed(1)}% time remaining
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full">
                          <DotsVerticalIcon className="w-5 h-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuItem>
                            <a
                              href={`/admin/lawyers/${lawyer.id}`}
                              className="flex w-full items-center"
                            >
                              View Profile
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <a
                              href={`/admin/lawyers/${lawyer.id}/cases`}
                              className="flex w-full items-center"
                            >
                              View Cases
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <a
                              href={`/admin/lawyers/${lawyer.id}/performance`}
                              className="flex w-full items-center"
                            >
                              Performance Report
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
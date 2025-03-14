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
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  status: string;
  lawyerProfile: {
    experience: number;
    rating: number;
    caseLoad: number;
    office: {
    name: string;
    };
    specializations: Array<{
      specialization: {
        name: string;
      };
    }>;
  };
  assignedCases: Array<{
  id: string;
    status: string;
  }>;
}

interface WorkloadStats {
  averageWorkload: number;
  maxWorkload: number;
  minWorkload: number;
  overloadedLawyers: number;
  underutilizedLawyers: number;
  totalCases: number;
}

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

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        router.push('/login');
        return;
      }

      const [lawyersResponse, statsResponse] = await Promise.all([
        fetch('/api/lawyers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/lawyers/workload/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!lawyersResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [lawyersData, statsData] = await Promise.all([
        lawyersResponse.json(),
        statsResponse.json()
      ]);

      if (lawyersData.success && statsData.success) {
        setLawyers(lawyersData.data);
        const { summary, distribution } = statsData.data;
        setStats({
          averageWorkload: summary.averageWorkload,
          maxWorkload: summary.maxWorkload,
          minWorkload: summary.minWorkload,
          overloadedLawyers: distribution.overloadedLawyers,
          underutilizedLawyers: distribution.underutilizedLawyers,
          totalCases: summary.totalCases
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load workload data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      const matchesOffice = filters.office === 'all' || lawyer.lawyerProfile.office.name === filters.office;
      const workloadLevel = getWorkloadLevel(lawyer.lawyerProfile.caseLoad);
      const matchesWorkload = filters.workloadLevel === 'all' || workloadLevel.toLowerCase() === filters.workloadLevel.toLowerCase();
      
      return matchesSearch && matchesOffice && matchesWorkload;
    })
    .sort((a, b) => {
      const aValue = sortConfig.key === 'caseLoad' ? a.lawyerProfile.caseLoad : a.lawyerProfile.rating;
      const bValue = sortConfig.key === 'caseLoad' ? b.lawyerProfile.caseLoad : b.lawyerProfile.rating;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const offices = Array.from(new Set(lawyers.map(l => l.lawyerProfile.office.name)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Lawyer Workload Management</h1>
          <p className="text-gray-500">Monitor and balance case distribution among lawyers</p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </Button>
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
              <TableHead>Office</TableHead>
              <TableHead>Specializations</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('caseLoad')}
              >
                Case Load {sortConfig.key === 'caseLoad' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('rating')}
              >
                Rating {sortConfig.key === 'rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Workload Level</TableHead>
              <TableHead>Distribution</TableHead>
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
                const workloadLevel = getWorkloadLevel(lawyer.lawyerProfile.caseLoad);
                const workloadPercentage = (lawyer.lawyerProfile.caseLoad / stats.maxWorkload) * 100;
                
                return (
                  <TableRow key={lawyer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lawyer.fullName}</div>
                        <div className="text-sm text-muted-foreground">{lawyer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{lawyer.lawyerProfile.office.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.lawyerProfile.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary">
                            {spec.specialization.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {lawyer.lawyerProfile.caseLoad} cases
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium">{lawyer.lawyerProfile.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">/5.0</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getWorkloadColor(workloadLevel)}>
                        {workloadLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <Progress value={workloadPercentage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {workloadPercentage.toFixed(1)}% of max
                        </div>
                      </div>
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
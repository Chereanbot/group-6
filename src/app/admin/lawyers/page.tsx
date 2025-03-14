"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LawyerStats } from '@/components/admin/lawyers/LawyerStats';
import { LawyerTable } from '@/components/admin/lawyers/LawyerTable';
import { LawyerFilters } from '@/components/admin/lawyers/LawyerFilters';
import { LawyerPerformance } from '@/components/admin/lawyers/LawyerPerformance';
import { CaseDistribution } from '@/components/admin/lawyers/CaseDistribution';
import { LawyerCalendar } from '@/components/admin/lawyers/LawyerCalendar';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import { AccessDenied } from '@/components/AccessDenied';
import { cookies } from 'next/headers';

type EventType = 'HEARING' | 'APPOINTMENT' | 'MEETING' | 'DEADLINE';

interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
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

interface LawyerStatsData {
  overview: {
    totalLawyers: number;
    activeLawyers: number;
    inactiveLawyers: number;
    totalCases: number;
    pendingCases: number;
    completedCases: number;
    averageRating: number;
  };
}

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  lawyerId: string;
}

interface PerformanceData {
  lawyer: {
    user: {
      fullName: string;
    };
  };
  metric: string;
  value: number;
  period: string;
  createdAt: string;
}

interface FiltersState {
  specialization: string;
  status: string;
  office: string;
  searchTerm: string;
  experience: string;
  caseLoad: string;
}

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<FiltersState>({
    specialization: 'all',
    status: 'all',
    office: 'all',
    searchTerm: '',
    experience: '',
    caseLoad: ''
  });
  
  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        status: filters.status,
        specialization: filters.specialization,
        office: filters.office,
        search: filters.searchTerm,
        ...(filters.experience && { experience: filters.experience }),
        ...(filters.caseLoad && { caseLoad: filters.caseLoad })
      });

      const response = await fetch(`/api/lawyers?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast.error('Please log in to access this page');
          router.push('/login');
          return;
        }
        throw new Error(data.message || 'Failed to fetch lawyers');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch lawyers');
      }

      // Transform the data if needed
      const transformedLawyers = data.data.map((lawyer: any) => ({
        id: lawyer.id,
        fullName: lawyer.fullName,
        email: lawyer.email,
        phone: lawyer.phone,
        status: lawyer.status,
        lawyerProfile: {
          experience: lawyer.lawyerProfile?.experience || 0,
          rating: lawyer.lawyerProfile?.rating || 0,
          caseLoad: lawyer.lawyerProfile?.caseLoad || 0,
          office: lawyer.lawyerProfile?.office || { name: 'Unassigned' },
          specializations: lawyer.lawyerProfile?.specializations || []
        },
        assignedCases: lawyer.assignedCases || []
      }));

      setLawyers(transformedLawyers);
    } catch (error) {
      console.error('Error loading lawyers data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access this page');
      router.push('/login');
      return;
    }
    loadData();
  }, [router, filters]); // Add filters to dependency array to reload when filters change

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">Error: {error}</div>
    </div>;
  }

  // Calculate stats for components
  const stats: LawyerStatsData = {
    overview: {
      totalLawyers: lawyers.length,
      activeLawyers: lawyers.filter(l => l.status === 'ACTIVE').length,
      inactiveLawyers: lawyers.filter(l => l.status !== 'ACTIVE').length,
      totalCases: lawyers.reduce((acc, l) => acc + l.lawyerProfile.caseLoad, 0),
      pendingCases: 0,
      completedCases: 0,
      averageRating: lawyers.reduce((acc, l) => acc + (l.lawyerProfile.rating || 0), 0) / lawyers.length || 0,
    }
  };

  // Prepare performance data
  const performanceData: PerformanceData[] = lawyers.map(lawyer => ({
    lawyer: {
      user: {
        fullName: lawyer.fullName
      }
    },
    metric: 'Cases Handled',
    value: lawyer.lawyerProfile.caseLoad,
    period: 'Current',
    createdAt: new Date().toISOString()
  }));

  // Prepare case distribution data
  const distributionData = lawyers.reduce((acc, lawyer) => {
    lawyer.lawyerProfile.specializations.forEach(spec => {
      const category = spec.specialization.name;
      const existingCategory = acc.find(item => item.category === category);
      if (existingCategory) {
        existingCategory._count++;
      } else {
        acc.push({ category, _count: 1 });
      }
    });
    return acc;
  }, [] as Array<{ category: string; _count: number }>);

  // Prepare calendar events
  const events: Event[] = lawyers.map(lawyer => ({
    id: lawyer.id,
    title: lawyer.fullName,
    start: new Date(),
    end: new Date(),
    type: 'APPOINTMENT' as EventType,
    lawyerId: lawyer.id
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lawyers and faculty members management</h1>
        <Button
          onClick={() => router.push('/admin/lawyers/new')}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Lawyer
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <LawyerFilters 
              filters={filters} 
              onFilterChange={setFilters} 
            />
            <LawyerStats stats={stats} />
            <LawyerTable 
              lawyers={lawyers} 
              loading={loading}
              onRefresh={loadData}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LawyerPerformance data={performanceData} />
            <CaseDistribution data={distributionData} />
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <LawyerCalendar 
            events={events} 
            lawyers={lawyers.map(l => ({ id: l.id, fullName: l.fullName }))} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
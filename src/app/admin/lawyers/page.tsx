"use client";

import { useState, useEffect } from 'react';
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

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    specialization: 'all',
    status: 'all',
    office: 'all',
    searchTerm: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Create URLSearchParams object
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          searchParams.append(key, value);
        }
      });

      const [lawyersRes, statsRes, eventsRes] = await Promise.all([
        fetch('/api/admin/lawyers?' + searchParams.toString()),
        fetch('/api/admin/lawyers/stats'),
        fetch('/api/admin/lawyers/events')
      ]);

      if (!lawyersRes.ok || !statsRes.ok || !eventsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [lawyersData, statsData, eventsData] = await Promise.all([
        lawyersRes.json(),
        statsRes.json(),
        eventsRes.json()
      ]);

      if (!lawyersData.success) {
        throw new Error(lawyersData.message || 'Failed to fetch lawyers');
      }

      if (!statsData.success) {
        throw new Error(statsData.message || 'Failed to fetch statistics');
      }

      setLawyers(lawyersData.data || []);
      setStats(statsData.data || null);
      setEvents(eventsData.data || []);
    } catch (error) {
      console.error('Error loading lawyers data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
            Lawyers and faculty members management
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
            Manage and monitor your legal team's performance
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/admin/lawyers/new'}
          className="bg-primary hover:bg-primary/90 text-white dark:bg-primary-dark dark:hover:bg-primary-dark/90"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Lawyer
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6">
        {stats && <LawyerStats stats={stats} />}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Filters */}
          <div className="bg-card dark:bg-card-dark rounded-lg shadow mb-6">
            <LawyerFilters
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>

          {/* Lawyers Table */}
          <div className="bg-card dark:bg-card-dark rounded-lg shadow">
            <LawyerTable
              lawyers={lawyers}
              loading={loading}
              onRefresh={loadData}
            />
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <LawyerCalendar
            events={events}
            lawyers={lawyers.map((lawyer: any) => ({
              id: lawyer.id,
              fullName: lawyer.fullName
            }))}
          />
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card dark:bg-card-dark rounded-lg shadow">
              <LawyerPerformance data={stats?.performance} />
            </div>
            <div className="bg-card dark:bg-card-dark rounded-lg shadow">
              <CaseDistribution data={stats?.caseDistribution} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
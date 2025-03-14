"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineCash,
  HiOutlineOfficeBuilding,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineExclamation,
  HiOutlineQuestionMarkCircle,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineChat,
  HiOutlineSupport,
  HiOutlineX,
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { CaseDistributionChart } from '@/components/coordinator/CaseDistributionChart';
import { PerformanceMetrics } from '@/components/coordinator/PerformanceMetrics';
import { HelpCenter } from '@/components/coordinator/help';

interface DashboardData {
  metrics: {
    totalCases: number;
    activeCases: number;
    pendingDocuments: number;
    upcomingAppointments: number;
    clientSatisfaction: number;
    responseRate: number;
  };
  recentCases: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    updatedAt: string;
  }>;
  appointments: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    clientName: string;
    type: string;
  }>;
}

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/coordinator/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

      setDashboardData(result.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
      console.error('Error in fetchDashboardData:', error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <HiOutlineExclamation className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg">{error || 'No dashboard data available'}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex-1 flex items-center">
              <div className="w-full max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cases, clients, or appointments..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 
                      bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white 
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHelpCenter(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200"
              >
                <HiOutlineQuestionMarkCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className={`px-4 sm:px-6 lg:px-8 py-8 ${showHelpCenter ? 'mr-80' : ''} transition-all duration-300`}>
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <QuickActionCard
                icon={HiOutlineUserGroup}
                title="Add Client"
                description="Register new client"
                onClick={() => router.push('/coordinator/clients/register')}
              />
              <QuickActionCard
                icon={HiOutlineOfficeBuilding}
                title="Office Management"
                description="Manage office resources"
                onClick={() => router.push('/coordinator/office')}
              />
              <QuickActionCard
                icon={HiOutlineScale}
                title="Case Management"
                description="Handle active cases"
                onClick={() => router.push('/coordinator/cases')}
              />
              <QuickActionCard
                icon={HiOutlineCog}
                title="Settings"
                description="System configuration"
                onClick={() => router.push('/coordinator/settings')}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Cases"
              value={dashboardData.metrics.totalCases}
              icon={HiOutlineScale}
              change={0}
              subStats={[
                { label: 'Active', value: dashboardData.metrics.activeCases },
                { label: 'Pending', value: dashboardData.metrics.totalCases - dashboardData.metrics.activeCases }
              ]}
            />
            <StatsCard
              title="Documents"
              value={dashboardData.metrics.pendingDocuments}
              icon={HiOutlineDocumentText}
              change={0}
              subStats={[
                { label: 'Verified', value: 0 },
                { label: 'Pending', value: dashboardData.metrics.pendingDocuments }
              ]}
            />
            <StatsCard
              title="Appointments"
              value={dashboardData.metrics.upcomingAppointments}
              icon={HiOutlineCalendar}
              change={0}
              subStats={[
                { label: 'Today', value: 0 },
                { label: 'Upcoming', value: dashboardData.metrics.upcomingAppointments }
              ]}
            />
            <StatsCard
              title="Performance"
              value={`${dashboardData.metrics.responseRate}%`}
              icon={HiOutlineChartBar}
              change={5}
              subStats={[
                { label: 'Response Rate', value: `${dashboardData.metrics.responseRate}%` },
                { label: 'Satisfaction', value: `${dashboardData.metrics.clientSatisfaction}%` }
              ]}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Case Distribution by Category</h2>
              <CaseDistributionChart />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance Metrics</h2>
              <PerformanceMetrics metrics={dashboardData.metrics} />
            </div>
          </div>

          {/* Recent Cases and Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Cases</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData.recentCases.map((caseItem) => (
                  <CaseCard key={caseItem.id} caseItem={caseItem} />
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData.appointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Center Panel */}
      {showHelpCenter && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowHelpCenter(false);
            setSelectedGuide(null);
          }} />
          <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl">
            <HelpCenter
              onClose={() => {
                setShowHelpCenter(false);
                setSelectedGuide(null);
              }}
              selectedGuide={selectedGuide}
              setSelectedGuide={setSelectedGuide}
            />
          </div>
        </div>
      )}

      {/* Customization Button */}
      <button
        onClick={() => setShowHelpCenter(true)}
        className="fixed right-4 bottom-4 p-3 bg-blue-500 text-white rounded-full shadow-lg 
          hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <HiOutlineQuestionMarkCircle className="h-6 w-6" />
      </button>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow flex items-start space-x-4"
    >
      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </button>
  );
}

function StatsCard({ title, value, icon: Icon, change, subStats }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
        {subStats.map((stat: any, index: number) => (
          <div key={index}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CaseCard({ caseItem }: { caseItem: any }) {
  const statusColors: any = {
    PENDING: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20',
    ACTIVE: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    CLOSED: 'text-gray-500 bg-gray-100 dark:bg-gray-900/20',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <HiOutlineScale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{caseItem.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Updated: {new Date(caseItem.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm ${statusColors[caseItem.status]}`}>
        {caseItem.status}
      </span>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: any }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <HiOutlineCalendar className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{appointment.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(appointment.startTime).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Client: {appointment.clientName}
          </p>
        </div>
      </div>
      <span className="px-3 py-1 rounded-full text-sm text-blue-500 bg-blue-100 dark:bg-blue-900/20">
        {appointment.type}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 p-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DashboardCustomizerProps {}

function DashboardCustomizer({}: DashboardCustomizerProps) {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-preferences');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      sections: [
        { id: 'quick-actions', title: 'Quick Actions', enabled: true },
        { id: 'stats-cards', title: 'Statistics Overview', enabled: true },
        { id: 'case-distribution', title: 'Case Distribution', enabled: true },
        { id: 'performance-metrics', title: 'Performance Metrics', enabled: true },
        { id: 'recent-cases', title: 'Recent Cases', enabled: true },
        { id: 'appointments', title: 'Upcoming Appointments', enabled: true },
      ],
      layout: 'comfortable',
      theme: 'system',
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const toggleSection = (sectionId: string) => {
    setPreferences(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, enabled: !section.enabled } : section
      ),
    }));
  };

  const updateLayout = (layout: 'compact' | 'comfortable') => {
    setPreferences(prev => ({ ...prev, layout }));
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <HiOutlineCog className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        <h2 className="ml-2 text-xl font-semibold">Dashboard Customization</h2>
      </div>

      {/* Layout Preferences */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Layout Density</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => updateLayout('comfortable')}
            className={`px-4 py-2 rounded-lg ${
              preferences.layout === 'comfortable'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Comfortable
          </button>
          <button
            onClick={() => updateLayout('compact')}
            className={`px-4 py-2 rounded-lg ${
              preferences.layout === 'compact'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Compact
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Theme</h3>
        <div className="flex space-x-4">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updateTheme(theme)}
              className={`px-4 py-2 rounded-lg capitalize ${
                preferences.theme === theme
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Section Visibility */}
      <div>
        <h3 className="text-lg font-medium mb-4">Visible Sections</h3>
        <div className="space-y-4">
          {preferences.sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span className="font-medium">{section.title}</span>
              <button
                onClick={() => toggleSection(section.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  section.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`${
                    section.enabled ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
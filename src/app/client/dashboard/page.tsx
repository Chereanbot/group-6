"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineCalendar, 
  HiOutlineCash,
  HiOutlineChat,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineUserGroup,
  HiOutlineBell,
  HiOutlineExclamation,
  HiOutlineDocumentDuplicate,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePlusCircle,
  HiOutlineInformationCircle,
  HiOutlineTrash
} from 'react-icons/hi';
import { MoreOptionsMenu } from '@/components/ui/MoreOptionsMenu';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { StatsCard } from './components/StatsCard';
import { QuickActions } from './components/QuickActions';
import { AppointmentCountdown } from './components/AppointmentCountdown';
import { NotificationsPanel } from './components/NotificationsPanel';
import { formatDateTime } from './utils/dateUtils';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Timeline } from './components/Timeline';
import { CaseProgress } from './components/CaseProgress';
import { CaseAnalytics } from './components/CaseAnalytics';
import { CaseDetailsAnalytics } from './components/CaseDetailsAnalytics';

const Dashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    nextAppointment: null,
    notifications: [],
    quickActions: []
  });
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    pendingCases: 0,
    casesByType: [],
    caseTimeline: [],
    averageResolutionTime: 0,
    successRate: 0,
    monthlyTrends: [],
    priorityDistribution: [],
    caseInsights: []
  });

  // Format relative time
  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return then.toLocaleDateString();
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, appointmentResponse, notificationsResponse, timelineResponse, casesResponse] = 
          await Promise.all([
            fetch('/api/client/stats'),
            fetch('/api/client/appointments/next'),
            fetch('/api/client/notifications'),
            fetch('/api/client/timeline'),
            fetch('/api/client/cases')
          ]);

        if (!statsResponse.ok || !appointmentResponse.ok || !notificationsResponse.ok || 
            !timelineResponse.ok || !casesResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, appointmentData, notificationsData, timelineData, casesData] = 
          await Promise.all([
            statsResponse.json(),
            appointmentResponse.json(),
            notificationsResponse.json(),
            timelineResponse.json(),
            casesResponse.json()
          ]);

        // Process analytics data
        const cases = casesData.data || [];
        const totalCases = cases.length;
        const activeCases = cases.filter(c => c.status === 'ACTIVE').length;
        const resolvedCases = cases.filter(c => c.status === 'RESOLVED').length;
        const pendingCases = cases.filter(c => c.status === 'PENDING').length;

        // Calculate case types distribution with trends
        interface CaseTypeStats {
          current: number;
          previous: number;
        }
        
        const caseTypes = cases.reduce((acc: Record<string, CaseTypeStats>, c) => {
          if (!acc[c.category]) {
            acc[c.category] = {
              current: 0,
              previous: 0
            };
          }
          acc[c.category].current += 1;
          return acc;
        }, {} as Record<string, CaseTypeStats>);

        // Calculate timeline data (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const timelineCounts = cases
          .filter(c => new Date(c.createdAt) >= thirtyDaysAgo)
          .reduce((acc, c) => {
            const date = new Date(c.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});

        // Calculate average resolution time and success rate
        const resolvedWithDates = cases.filter(c => 
          c.status === 'RESOLVED' && c.createdAt && c.updatedAt
        );
        
        const avgResolutionTime = resolvedWithDates.length > 0
          ? resolvedWithDates.reduce((acc, c) => {
              const createdDate = new Date(c.createdAt).getTime();
              const updatedDate = new Date(c.updatedAt).getTime();
              const days = Math.floor((updatedDate - createdDate) / (1000 * 60 * 60 * 24));
              return acc + days;
            }, 0) / resolvedWithDates.length
          : 0;

        const successRate = totalCases > 0
          ? (resolvedCases / totalCases) * 100
          : 0;

        // Calculate monthly trends
        const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.toLocaleString('default', { month: 'short' });
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const monthCases = cases.filter(c => {
            const caseDate = new Date(c.createdAt);
            return caseDate >= monthStart && caseDate <= monthEnd;
          });

          const resolvedInMonth = cases.filter(c => {
            const resolvedDate = new Date(c.updatedAt);
            return c.status === 'RESOLVED' && resolvedDate >= monthStart && resolvedDate <= monthEnd;
          });

          return {
            month,
            newCases: monthCases.length,
            resolvedCases: resolvedInMonth.length,
            avgResolutionDays: resolvedInMonth.length > 0
              ? resolvedInMonth.reduce((acc, c) => {
                  const days = Math.floor((new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  return acc + days;
                }, 0) / resolvedInMonth.length
              : 0
          };
        }).reverse();

        // Calculate priority distribution
        const priorityDistribution = ['HIGH', 'MEDIUM', 'LOW'].map(priority => {
          const count = cases.filter(c => c.priority === priority).length;
          return {
            priority,
            count,
            percentage: totalCases > 0 ? (count / totalCases) * 100 : 0
          };
        });

        // Calculate case insights
        const previousMonthCases = monthlyTrends[4]?.newCases || 0;
        const currentMonthCases = monthlyTrends[5]?.newCases || 0;
        const casesChange = previousMonthCases > 0
          ? ((currentMonthCases - previousMonthCases) / previousMonthCases) * 100
          : 0;

        const caseInsights = [
          {
            title: 'New Cases',
            value: currentMonthCases,
            change: casesChange,
            trend: casesChange >= 0 ? 'up' : 'down'
          },
          {
            title: 'Resolution Rate',
            value: `${Math.round((resolvedCases / totalCases) * 100)}%`,
            change: 5.2, // Example value, calculate actual change
            trend: 'up'
          },
          {
            title: 'Avg. Time to Resolve',
            value: `${Math.round(avgResolutionTime)} days`,
            change: -2.1, // Example value, calculate actual change
            trend: 'down'
          },
          {
            title: 'Client Satisfaction',
            value: '94%',
            change: 1.5,
            trend: 'up'
          }
        ];

        setAnalyticsData({
          totalCases,
          activeCases,
          resolvedCases,
          pendingCases,
          casesByType: Object.entries(caseTypes).map(([type, data]: [string, CaseTypeStats]) => ({
            type,
            count: data.current,
            trend: data.previous > 0 ? ((data.current - data.previous) / data.previous) * 100 : 0
          })),
          caseTimeline: Object.entries(timelineCounts).map(([date, count]) => ({
            date,
            count: count as number,
            resolved: 0,
            pending: 0
          })),
          averageResolutionTime: avgResolutionTime,
          successRate,
          monthlyTrends,
          priorityDistribution,
          caseInsights
        });

        // Set default values if data is missing
        const stats = {
          activeCases: statsData?.data?.activeCases || 0,
          upcomingAppointments: statsData?.data?.upcomingAppointments || 0,
          pendingPayments: statsData?.data?.pendingPayments || 0,
          unreadMessages: statsData?.data?.unreadMessages || 0,
          casesChange: statsData?.data?.casesChange || 0,
          appointmentsChange: statsData?.data?.appointmentsChange || 0,
          messagesChange: statsData?.data?.messagesChange || 0
        };

        setDashboardData({
          stats: [
            {
              title: 'Active Cases',
              value: stats.activeCases,
              icon: HiOutlineDocumentText,
              color: 'bg-blue-100 text-blue-600',
              trend: { value: stats.casesChange, isPositive: stats.casesChange > 0 }
            },
            {
              title: 'Appointments',
              value: stats.upcomingAppointments,
              icon: HiOutlineCalendar,
              color: 'bg-green-100 text-green-600',
              trend: { value: stats.appointmentsChange, isPositive: true }
            },
            {
              title: 'Pending Payments',
              value: stats.pendingPayments,
              icon: HiOutlineCash,
              color: 'bg-yellow-100 text-yellow-600'
            },
            {
              title: 'Messages',
              value: stats.unreadMessages,
              icon: HiOutlineChat,
              color: 'bg-purple-100 text-purple-600',
              trend: { value: stats.messagesChange, isPositive: false }
            }
          ],
          nextAppointment: appointmentData?.data || null,
          notifications: notificationsData?.data || [],
          quickActions: [
            {
              id: 'book-appointment',
              title: 'Book Appointment',
              icon: HiOutlineCalendar,
              color: 'bg-blue-100 text-blue-600',
              href: '/client/appointments/book',
              description: 'Schedule a meeting with your lawyer'
            },
            {
              id: 'make-payment',
              title: 'Make Payment',
              icon: HiOutlineCash,
              color: 'bg-green-100 text-green-600',
              href: '/client/payments',
              description: 'View and pay pending invoices'
            },
            {
              id: 'message-lawyer',
              title: 'Message Lawyer',
              icon: HiOutlineChat,
              color: 'bg-purple-100 text-purple-600',
              href: '/client/messages',
              description: 'Send a message to your lawyer'
            },
            {
              id: 'submit-document',
              title: 'Submit Document',
              icon: HiOutlineDocumentText,
              color: 'bg-yellow-100 text-yellow-600',
              href: '/client/documents/upload',
              description: 'Upload documents for your case'
            }
          ]
        });

        setTimelineEvents(timelineData?.data || []);

        // Set active case
        const activeCase = casesData?.data?.find(c => 
          c.status !== 'RESOLVED' && c.status !== 'CANCELLED'
        );
        if (activeCase) {
          setActiveCase({
            ...activeCase,
            stages: [
              {
                id: 'initial',
                title: 'Initial Consultation',
                description: 'Initial meeting and case evaluation',
                status: 'COMPLETED',
                completedAt: activeCase.createdAt,
                requirements: ['Valid ID', 'Case Documents']
              },
              {
                id: 'review',
                title: 'Case Review',
                description: 'Legal team reviews your case details',
                status: activeCase.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED',
                estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                id: 'strategy',
                title: 'Strategy Development',
                description: 'Developing legal strategy and action plan',
                status: activeCase.status === 'ACTIVE' ? 'IN_PROGRESS' : 'PENDING',
                requirements: ['Additional Documentation', 'Client Approval']
              },
              {
                id: 'execution',
                title: 'Case Execution',
                description: 'Implementing legal strategy and representation',
                status: 'PENDING'
              },
              {
                id: 'resolution',
                title: 'Case Resolution',
                description: 'Final steps and case closure',
                status: 'PENDING'
              }
            ],
            currentStage: activeCase.status === 'PENDING' ? 1 : 2,
            progress: activeCase.status === 'PENDING' ? 30 : 60
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await fetch(`/api/client/notifications/${id}/read`, { method: 'POST' });
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await fetch(`/api/client/notifications/${id}`, { method: 'DELETE' });
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.filter(notif => notif.id !== id)
      }));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'book-appointment':
        router.push('/client/appointments/book');
        break;
      case 'make-payment':
        router.push('/client/registration/payment');
        break;
      case 'message-lawyer':
        router.push('/client/messages');
        break;
      case 'submit-document':
        router.push('/client/documents/upload');
        break;
      default:
        break;
    }
  };

  const handleTimelineEventClick = (event: any) => {
    const eventType = event.id.split('-')[0];
    const eventId = event.id.split('-')[1];

    switch (eventType) {
      case 'case':
        router.push(`/client/cases/${eventId}`);
        break;
      case 'appointment':
        router.push(`/client/appointments/${eventId}`);
        break;
      case 'payment':
        router.push(`/client/payments/${eventId}`);
        break;
      case 'document':
        window.open(event.metadata.documentUrl, '_blank');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          Welcome back
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
          {dashboardData.stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        <QuickActions actions={dashboardData.quickActions} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-12">
            <CaseDetailsAnalytics
              data={analyticsData}
              onTimeRangeChange={(range) => {
                // Handle time range change
                console.log('Time range changed:', range);
              }}
            />
      </div>

          <div className="xl:col-span-8 space-y-6">
            {activeCase && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CaseProgress
                  caseId={activeCase.id}
                  stages={activeCase.stages}
                  currentStage={activeCase.currentStage}
                  progress={activeCase.progress}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Timeline
                events={timelineEvents}
                onEventClick={handleTimelineEventClick}
              />
            </motion.div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            {dashboardData.nextAppointment && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <AppointmentCountdown
                  title="Next Appointment"
                  description={`with ${dashboardData.nextAppointment.lawyerName}`}
                  targetDate={new Date(dashboardData.nextAppointment.datetime).toISOString()}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <NotificationsPanel
                notifications={dashboardData.notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onDismiss={handleDismissNotification}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard; 
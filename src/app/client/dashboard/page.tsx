"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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
import { IconType } from 'react-icons';
import { useLanguage } from '@/providers/LanguageProvider';

interface HelpHint {
  category: string;
  messages: string[];
  icon: IconType;
  color: string;
}

const Dashboard = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showHelpHint, setShowHelpHint] = useState(true);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showInitialHints, setShowInitialHints] = useState(true);
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

  // Enhanced initial help messages
  const initialHelpMessages = [
    {
      text: t('dashboard.help.welcome', '👋 Welcome! Need help getting started?'),
      color: "bg-blue-500",
      position: { x: -120, y: -80 }
    },
    {
      text: t('dashboard.help.quickAssistance', '📱 Click here for quick assistance!'),
      color: "bg-purple-500",
      position: { x: -100, y: -40 }
    },
    {
      text: t('dashboard.help.discoverFeatures', '💡 Discover all features'),
      color: "bg-green-500",
      position: { x: -80, y: -120 }
    }
  ];

  // Enhanced help hints with categories and messages
  const helpHints: HelpHint[] = [
    {
      category: t('dashboard.helpHints.navigation.category', 'Navigation'),
      messages: [
        t('dashboard.helpHints.navigation.message1', '👋 Need help finding your way around?'),
        t('dashboard.helpHints.navigation.message2', '🎯 Looking for specific features?'),
        t('dashboard.helpHints.navigation.message3', '🗺️ Want to explore all capabilities?')
      ],
      icon: HiOutlineLocationMarker,
      color: "text-blue-500"
    },
    {
      category: t('dashboard.helpHints.caseManagement.category', 'Case Management'),
      messages: [
        t('dashboard.helpHints.caseManagement.message1', '📊 Want to track your case progress?'),
        t('dashboard.helpHints.caseManagement.message2', '📁 Need to manage documents?'),
        t('dashboard.helpHints.caseManagement.message3', '⚖️ Looking for case updates?')
      ],
      icon: HiOutlineDocumentText,
      color: "text-purple-500"
    },
    {
      category: t('dashboard.helpHints.support.category', 'Support'),
      messages: [
        t('dashboard.helpHints.support.message1', '🤝 Need assistance with anything?'),
        t('dashboard.helpHints.support.message2', '💬 Want to chat with support?'),
        t('dashboard.helpHints.support.message3', '❓ Have questions about services?')
      ],
      icon: HiOutlineChat,
      color: "text-green-500"
    }
  ];

  const CurrentHintIcon = helpHints[currentHintIndex].icon;

  // Animation variants
  const floatingVariants: Variants = {
    hidden: { opacity: 0, y: 20, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 3
      }
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const buttonVariants: Variants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3
      }
    },
    hover: {
      scale: 1.15,
      rotate: 180,
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  };

  const menuItemVariants: Variants = {
    initial: { x: -10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    hover: { scale: 1.05, x: 5 }
  };

  const notificationDotVariants: Variants = {
    initial: { scale: 0 },
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  // Animation variants for initial messages
  const initialMessageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.3,
        duration: 0.5,
        repeat: 3,
        repeatType: "reverse"
      }
    }),
    exit: { 
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  // Floating animation for messages
  const floatingAnimation = {
    y: [-5, 5],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  };

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
            title: t('dashboard.caseInsights.newCases.title', 'New Cases'),
            value: currentMonthCases,
            change: casesChange,
            trend: casesChange >= 0 ? 'up' : 'down'
          },
          {
            title: t('dashboard.caseInsights.resolutionRate.title', 'Resolution Rate'),
            value: `${Math.round((resolvedCases / totalCases) * 100)}%`,
            change: 5.2, // Example value, calculate actual change
            trend: 'up'
          },
          {
            title: t('dashboard.caseInsights.avgTimeToResolve.title', 'Avg. Time to Resolve'),
            value: `${Math.round(avgResolutionTime)} days`,
            change: -2.1, // Example value, calculate actual change
            trend: 'down'
          },
          {
            title: t('dashboard.caseInsights.clientSatisfaction.title', 'Client Satisfaction'),
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
              title: t('dashboard.stats.activeCases.title', 'Active Cases'),
              value: stats.activeCases,
              icon: HiOutlineDocumentText,
              color: 'bg-blue-100 text-blue-600',
              trend: { value: stats.casesChange, isPositive: stats.casesChange > 0 }
            },
            {
              title: t('dashboard.stats.appointments.title', 'Appointments'),
              value: stats.upcomingAppointments,
              icon: HiOutlineCalendar,
              color: 'bg-green-100 text-green-600',
              trend: { value: stats.appointmentsChange, isPositive: true }
            },
            {
              title: t('dashboard.stats.pendingPayments.title', 'Pending Payments'),
              value: stats.pendingPayments,
              icon: HiOutlineCash,
              color: 'bg-yellow-100 text-yellow-600'
            },
            {
              title: t('dashboard.stats.messages.title', 'Messages'),
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
              title: t('dashboard.quickActions.bookAppointment.title', 'Book Appointment'),
              icon: HiOutlineCalendar,
              color: 'bg-blue-100 text-blue-600',
              href: '/client/appointments/list',
              description: t('dashboard.quickActions.bookAppointment.description', 'Schedule a meeting with your lawyer')
            },
            {
              id: 'make-payment',
              title: t('dashboard.quickActions.makePayment.title', 'Make Payment'),
              icon: HiOutlineCash,
              color: 'bg-green-100 text-green-600',
              href: '/client/registration/payment',
              description: t('dashboard.quickActions.makePayment.description', 'View and pay pending invoices')
            },
            {
              id: 'message-lawyer',
              title: t('dashboard.quickActions.messageLawyer.title', 'Message Lawyer'),
              icon: HiOutlineChat,
              color: 'bg-purple-100 text-purple-600',
              href: '/client/communication/messages',
              description: t('dashboard.quickActions.messageLawyer.description', 'Send a message to your lawyer')
            },
            {
              id: 'submit-document',
              title: t('dashboard.quickActions.submitDocument.title', 'Submit Document'),
              icon: HiOutlineDocumentText,
              color: 'bg-yellow-100 text-yellow-600',
              href: '/client/documents/upload',
              description: t('dashboard.quickActions.submitDocument.description', 'Upload documents for your case')
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
                title: t('dashboard.caseProgress.initial.title', 'Initial Consultation'),
                description: t('dashboard.caseProgress.initial.description', 'Initial meeting and case evaluation'),
                status: 'COMPLETED',
                completedAt: activeCase.createdAt,
                requirements: ['Valid ID', 'Case Documents']
              },
              {
                id: 'review',
                title: t('dashboard.caseProgress.review.title', 'Case Review'),
                description: t('dashboard.caseProgress.review.description', 'Legal team reviews your case details'),
                status: activeCase.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED',
                estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                id: 'strategy',
                title: t('dashboard.caseProgress.strategy.title', 'Strategy Development'),
                description: t('dashboard.caseProgress.strategy.description', 'Developing legal strategy and action plan'),
                status: activeCase.status === 'ACTIVE' ? 'IN_PROGRESS' : 'PENDING',
                requirements: ['Additional Documentation', 'Client Approval']
              },
              {
                id: 'execution',
                title: t('dashboard.caseProgress.execution.title', 'Case Execution'),
                description: t('dashboard.caseProgress.execution.description', 'Implementing legal strategy and representation'),
                status: 'PENDING'
              },
              {
                id: 'resolution',
                title: t('dashboard.caseProgress.resolution.title', 'Case Resolution'),
                description: t('dashboard.caseProgress.resolution.description', 'Final steps and case closure'),
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
          title: t('dashboard.error.title', "Error"),
          description: t('dashboard.error.description', "Failed to load dashboard data. Please try again later."),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Show initial hints for 10 seconds
    const initialHintTimer = setTimeout(() => {
      setShowInitialHints(false);
    }, 10000);

    // Then show rotating category hints for another 10 seconds
    const categoryHintTimer = setTimeout(() => {
      setShowHelpHint(false);
    }, 20000);

    // Rotate through hint categories
    const hintInterval = setInterval(() => {
      setCurrentHintIndex((prev) => (prev + 1) % helpHints.length);
    }, 5000);

    return () => {
      clearTimeout(initialHintTimer);
      clearTimeout(categoryHintTimer);
      clearInterval(hintInterval);
    };
  }, [helpHints.length]);

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
        router.push('/client/appointments/list');
        break;
      case 'make-payment':
        router.push('/client/registration/payment');
        break;
      case 'message-lawyer':
        router.push('/client/communication/messages');
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

  // Add help action handler
  const handleHelpAction = (action: string) => {
    switch (action) {
      case 'tutorial':
        // Handle tutorial action
        router.push('/client/tutorial');
        break;
      case 'faq':
        // Handle FAQ action
        router.push('/client/faq');
        break;
      case 'support':
        // Handle support action
        router.push('/client/support');
        break;
      case 'documentation':
        // Handle documentation action
        router.push('/client/documentation');
        break;
      default:
        break;
    }
    setShowHelpMenu(false);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-0"
    >
      <div className="max-w-full space-y-6 px-4 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          {t('dashboard.welcome', 'Welcome back')}
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
                  title={t('dashboard.nextAppointment.title', 'Next Appointment')}
                  description={t('dashboard.nextAppointment.description', `with ${dashboardData.nextAppointment.lawyerName}`)}
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
      {/* Enhanced Help Button Section */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showInitialHints && (
            <div className="absolute bottom-0 right-0">
              {initialHelpMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  variants={initialMessageVariants}
                  style={{
                    position: 'absolute',
                    bottom: message.position.y,
                    right: message.position.x,
                    transformOrigin: 'bottom right'
                  }}
                  className="whitespace-nowrap"
                >
                  <motion.div
                    animate={floatingAnimation}
                    className={`${message.color} text-white px-4 py-2 rounded-full shadow-lg 
                               text-sm font-medium flex items-center space-x-2 
                               backdrop-blur-sm bg-opacity-90 cursor-pointer
                               hover:bg-opacity-100 transition-all duration-300`}
                    onClick={() => {
                      setShowHelpMenu(true);
                      setShowInitialHints(false);
                      setShowHelpHint(false);
                    }}
                  >
                    <span>{message.text}</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}

          {showHelpHint && !showInitialHints && (
            <div className="absolute bottom-full right-0 mb-6 space-y-3">
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={floatingVariants}
                custom={currentHintIndex}
                className="relative"
              >
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xs
                             hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setShowHelpMenu(true);
                    setShowHelpHint(false);
                  }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`${helpHints[currentHintIndex].color} p-2 rounded-full bg-opacity-10`}>
                      <CurrentHintIcon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {helpHints[currentHintIndex].category}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {helpHints[currentHintIndex].messages.map((message, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-sm text-gray-600 dark:text-gray-300"
                      >
                        {message}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <motion.button
            onClick={() => {
              setShowHelpMenu(!showHelpMenu);
              setShowHelpHint(false);
              setShowInitialHints(false);
            }}
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                       text-white rounded-full p-4 shadow-lg transition-all duration-300 
                       flex items-center justify-center relative group"
          >
            <HiOutlineInformationCircle className="w-7 h-7 group-hover:rotate-180 transition-transform duration-300" />
            <motion.div
              variants={notificationDotVariants}
              initial="initial"
              animate="animate"
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            />
          </motion.button>

          <AnimatePresence>
            {showHelpMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute bottom-full right-0 mb-4 w-80 bg-white dark:bg-gray-800 
                           rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">
                    {t('dashboard.helpMenu.title', 'How can we help you?')}
                  </div>
                  
                  {[
                    {
                      id: 'tutorial',
                      title: t('dashboard.helpMenu.tutorial.title', 'Take a Tour'),
                      description: t('dashboard.helpMenu.tutorial.description', 'Get started with a guided tour'),
                      icon: HiOutlineClipboardCheck,
                      color: 'text-blue-600'
                    },
                    {
                      id: 'faq',
                      title: t('dashboard.helpMenu.faq.title', 'FAQ'),
                      description: t('dashboard.helpMenu.faq.description', 'Find answers to common questions'),
                      icon: HiOutlineDocumentText,
                      color: 'text-green-600'
                    },
                    {
                      id: 'support',
                      title: t('dashboard.helpMenu.support.title', 'Contact Support'),
                      description: t('dashboard.helpMenu.support.description', 'Get help from our team'),
                      icon: HiOutlineChat,
                      color: 'text-purple-600'
                    },
                    {
                      id: 'documentation',
                      title: t('dashboard.helpMenu.documentation.title', 'Documentation'),
                      description: t('dashboard.helpMenu.documentation.description', 'Browse detailed guides'),
                      icon: HiOutlineDocumentDuplicate,
                      color: 'text-orange-600'
                    }
                  ].map((item, index) => (
                    <motion.button
                      key={item.id}
                      variants={menuItemVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleHelpAction(item.id)}
                      className="flex items-start space-x-4 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 
                                rounded-lg transition-all duration-200 group"
                    >
                      <div className={`p-2 rounded-lg ${item.color} bg-opacity-10 group-hover:bg-opacity-20`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard; 
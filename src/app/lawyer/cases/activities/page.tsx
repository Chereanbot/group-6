import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CaseStatus, Priority, UserRoleEnum, Notification } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { ActivityTimeline } from '@/components/lawyer/cases/ActivityTimeline';
import { format, isToday, isYesterday, isThisWeek, isThisMonth, addDays, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
  createdBy: {
    fullName: string;
    role: string;
  };
  case: {
    id: string;
    title: string;
    status: string;
    priority: string;
    client: {
      fullName: string;
    };
  };
}

interface GroupedActivities {
  [key: string]: Activity[];
}

async function getUpcomingCourtDates(lawyerId: string) {
  const nextWeek = addDays(new Date(), 7);
  
  return await prisma.appealHearing.findMany({
    where: {
      appeal: {
        case: {
          lawyerId,
        }
      },
      scheduledDate: {
        gte: new Date(),
        lte: nextWeek
      }
    },
    include: {
      appeal: {
        include: {
          case: {
            select: {
              id: true,
              title: true,
              client: {
                select: {
                  fullName: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      scheduledDate: 'asc'
    }
  });
}

async function getLawyerCaseActivities(lawyerId: string, timeframe: string = 'all') {
  const now = new Date();
  let dateFilter = {};

  switch (timeframe) {
    case 'today':
      dateFilter = {
        createdAt: {
          gte: new Date(now.setHours(0, 0, 0, 0))
        }
      };
      break;
    case 'week':
      dateFilter = {
        createdAt: {
          gte: new Date(now.setDate(now.getDate() - 7))
        }
      };
      break;
    case 'month':
      dateFilter = {
        createdAt: {
          gte: new Date(now.setMonth(now.getMonth() - 1))
        }
      };
      break;
  }

  // Get case activities
  const activities = await prisma.caseActivity.findMany({
    where: {
      case: {
        lawyerId,
      },
      ...dateFilter
    },
    include: {
      case: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          client: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          userRole: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  // Get unread notifications
  const notifications = await prisma.notification.findMany({
    where: {
      userId: lawyerId,
      status: 'UNREAD'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Get upcoming court dates
  const upcomingCourt = await getUpcomingCourtDates(lawyerId);

  // Group activities by date
  const groupedActivities = activities.reduce<GroupedActivities>((groups, activity) => {
    const date = format(new Date(activity.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      createdAt: activity.createdAt,
      createdBy: {
        fullName: activity.user?.fullName || 'Unknown User',
        role: activity.user?.userRole || 'UNKNOWN'
      },
      case: {
        id: activity.case.id,
        title: activity.case.title,
        status: activity.case.status,
        priority: activity.case.priority,
        client: {
          fullName: activity.case.client.fullName
        }
      }
    });
    return groups;
  }, {});

  return {
    activities: groupedActivities,
    notifications,
    upcomingCourt,
    totalActivities: activities.length
  };
}

export default async function CaseActivitiesPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    console.error('No user ID found in headers');
    redirect('/auth/login?error=unauthorized&message=Please_login_first');
  }

  if (userRole !== 'LAWYER') {
    console.error('User is not a lawyer');
    redirect('/unauthorized?message=Only_lawyers_can_access_this_page');
  }

  try {
    const { activities, notifications, upcomingCourt, totalActivities } = await getLawyerCaseActivities(userId);

    return (
      <div className="space-y-6 p-6">
        {/* Upcoming Court Dates Alert */}
        {upcomingCourt.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Upcoming Court Dates</h3>
                <div className="mt-2 space-y-2">
                  {upcomingCourt.map((hearing) => (
                    <div key={hearing.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {hearing.appeal.case.title} - {hearing.appeal.case.client.fullName}
                        </p>
                        <p className="text-sm text-blue-700">
                          {format(new Date(hearing.scheduledDate), 'MMMM d, yyyy - h:mm a')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-4"
                        asChild
                      >
                        <Link href={`/lawyer/cases/${hearing.appeal.case.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notifications Card */}
        {notifications.length > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Recent Notifications</h3>
                <div className="mt-2 space-y-2">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between">
                      <p className="text-sm text-yellow-800">{notification.message}</p>
                      <span className="text-xs text-yellow-600">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Activities Card */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Case Activities</h2>
              <p className="text-muted-foreground">
                Track and monitor all case-related activities
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-muted-foreground" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                Total: {totalActivities} activities
              </span>
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Time</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>

          {Object.entries(activities).map(([date, dateActivities]) => (
            <div key={date} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {isToday(new Date(date)) 
                  ? 'Today' 
                  : isYesterday(new Date(date))
                  ? 'Yesterday'
                  : format(new Date(date), 'MMMM d, yyyy')}
              </h3>
              <ActivityTimeline activities={dateActivities} />
            </div>
          ))}

          {Object.keys(activities).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No activities found for the selected period
            </div>
          )}
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading case activities:', error);
    return <div>Error: Something went wrong</div>;
  }
} 
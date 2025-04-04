"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineDotsVertical,
  HiOutlineRefresh,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineExclamation,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationGuide from './NotificationGuide';

interface NotificationHistoryProps {
  userId: string;
  userType: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'URGENT' | 'NORMAL';
  status: 'READ' | 'UNREAD';
  createdAt: string;
  metadata: {
    appointmentId: string;
    purpose: string;
    duration: number;
    hoursUntil: number;
  };
}

interface SMSMessage {
  id: string;
  recipientPhone: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: string;
}

export default function NotificationHistory({ userId, userType }: NotificationHistoryProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'notifications' | 'sms'>('notifications');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [smsHistory, setSMSHistory] = useState<SMSMessage[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchNotificationHistory();
  }, [userId]);

  const fetchNotificationHistory = async () => {
    try {
      setLoading(true);
      const [notificationsRes, smsRes] = await Promise.all([
        fetch('/api/notifications/history'),
        fetch('/api/sms/history')
      ]);

      if (notificationsRes.ok && smsRes.ok) {
        const [notificationsData, smsData] = await Promise.all([
          notificationsRes.json(),
          smsRes.json()
        ]);

        setNotifications(notificationsData.notifications);
        setSMSHistory(smsData.messages);
      } else {
        toast({
          variant: "destructive",
          title: "Error fetching history",
          description: "Failed to load notification history.",
        });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching history.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (id: string, type: 'notification' | 'sms') => {
    try {
      const response = await fetch(`/api/${type}/resend/${id}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${type === 'notification' ? 'Notification' : 'SMS'} resent successfully.`,
        });
        fetchNotificationHistory();
      } else {
        throw new Error('Failed to resend');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to resend ${type}.`,
      });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, status: 'READ' } : n
        ));
        toast({
          title: "Success",
          description: "Notification marked as read.",
        });
      } else {
        throw new Error('Failed to mark as read');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification status.",
      });
    }
  };

  const filterItems = (items: any[]) => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        (item.message || item.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

      const itemDate = new Date(item.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

      const matchesDate = dateFilter === 'all' ||
        (dateFilter === 'today' && daysDiff === 0) ||
        (dateFilter === 'week' && daysDiff <= 7) ||
        (dateFilter === 'month' && daysDiff <= 30);

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredNotifications = filterItems(notifications);
  const filteredSMS = filterItems(smsHistory);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'read':
      case 'sent':
        return 'secondary';
      case 'unread':
      case 'pending':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Help Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-8 right-1/2 transform translate-x-1/2 z-50"
      >
        <Button
          variant="outline"
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800 flex items-center gap-2"
          onClick={() => setShowGuide(true)}
        >
          <HiOutlineQuestionMarkCircle className="h-5 w-5" />
          <span>Need Help?</span>
        </Button>
      </motion.div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notifications')}
            className="flex items-center gap-2"
          >
            <HiOutlineMail className="h-4 w-4" />
            Notifications
            {notifications.filter(n => n.status === 'UNREAD').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.filter(n => n.status === 'UNREAD').length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'sms' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sms')}
            className="flex items-center gap-2"
          >
            <HiOutlinePhone className="h-4 w-4" />
            SMS
            {smsHistory.filter(s => s.status === 'PENDING').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {smsHistory.filter(s => s.status === 'PENDING').length}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchNotificationHistory}
            className="shrink-0"
          >
            <HiOutlineRefresh className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-500"
                  >
                    Loading...
                  </motion.div>
                </div>
              ) : activeTab === 'notifications' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <HiOutlineExclamation className="h-8 w-8" />
                            <p>No notifications found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <motion.tr
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="max-w-md">
                            <div>
                              <div className="font-medium">{notification.title}</div>
                              <div className="text-sm text-gray-500">{notification.message}</div>
                              {notification.priority === 'URGENT' && (
                                <Badge variant="destructive" className="mt-1">Urgent</Badge>
                              )}
                              {notification.metadata && (
                                <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                                  <HiOutlineCalendar className="h-4 w-4" />
                                  <span>Appointment in {notification.metadata.hoursUntil} hours</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(notification.status)}>
                              {notification.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <HiOutlineDotsVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {notification.status === 'UNREAD' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                      <HiOutlineCheck className="mr-2 h-4 w-4" />
                                      Mark as read
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleResend(notification.id, 'notification')}>
                                  <HiOutlineRefresh className="mr-2 h-4 w-4" />
                                  Resend
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSMS.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <HiOutlineExclamation className="h-8 w-8" />
                            <p>No SMS messages found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSMS.map((sms) => (
                        <motion.tr
                          key={sms.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell>{sms.recipientPhone}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="text-sm">{sms.content}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(sms.status)}>
                              {sms.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {formatDistanceToNow(new Date(sms.createdAt), { addSuffix: true })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(new Date(sms.createdAt), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleResend(sms.id, 'sms')}
                            >
                              <HiOutlineRefresh className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuide && <NotificationGuide onClose={() => setShowGuide(false)} />}
      </AnimatePresence>
    </div>
  );
} 
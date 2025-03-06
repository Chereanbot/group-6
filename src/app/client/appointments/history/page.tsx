"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/providers/LanguageProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Appointment {
  id: string;
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: string;
  notes: string;
  caseType: string;
  venue: string;
  priority: string;
  requiredDocuments: string[];
  coordinator: {
    name: string;
    email: string;
    phone: string;
    office: {
      name: string;
      address: string;
      phone: string;
      email: string;
      location: string;
    } | null;
  };
  notifications?: {
    id: string;
    type: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AppointmentHistory() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [page, search, status, dateRange]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(dateRange.from && { startDate: dateRange.from.toISOString() }),
        ...(dateRange.to && { endDate: dateRange.to.toISOString() }),
      });

      const response = await fetch(`/api/client/appointments/history?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      if (data.success) {
        setAppointments(data.data.appointments || []);
        setTotalPages(data.data.pagination.pages);
      } else {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      toast({
        title: t('appointments.history.error'),
        description: error.message,
        variant: "destructive",
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-500',
      COMPLETED: 'bg-green-500',
      CANCELLED: 'bg-red-500',
      RESCHEDULED: 'bg-yellow-500',
      PENDING: 'bg-purple-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-4xl font-bold">{t('appointments.history.title')}</h1>
          <p className="text-muted-foreground">
            {t('appointments.history.description')}
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('appointments.history.filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder={t('appointments.history.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('appointments.history.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              <div className="col-span-2">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range: any) => setDateRange(range)}
                  className="rounded-md border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderSkeleton()}
            </motion.div>
          ) : appointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <p className="text-muted-foreground">{t('appointments.history.noAppointments')}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-4"
            >
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="w-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{appointment.purpose}</CardTitle>
                        <CardDescription>
                          {format(new Date(appointment.scheduledTime), 'PPP p')}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">{t('appointments.details.coordinator')}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.coordinator.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('appointments.details.venue')}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.venue || t('appointments.details.noVenue')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Appointment Details</DialogTitle>
                          <DialogDescription>
                            {format(new Date(appointment.scheduledTime), 'PPP p')}
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="coordinator">Coordinator</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                          </TabsList>
                          <TabsContent value="details">
                            <Card>
                              <CardContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">Purpose</p>
                                    <p className="text-muted-foreground">{appointment.purpose}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Case Type</p>
                                    <p className="text-muted-foreground">{appointment.caseType}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Duration</p>
                                    <p className="text-muted-foreground">{appointment.duration} minutes</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Priority</p>
                                    <p className="text-muted-foreground">{appointment.priority}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium">Required Documents</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {appointment.requiredDocuments.map((doc, index) => (
                                      <Badge key={index} variant="secondary">
                                        {doc}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                {appointment.notes && (
                                  <div>
                                    <p className="font-medium">Notes</p>
                                    <p className="text-muted-foreground">{appointment.notes}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                          <TabsContent value="coordinator">
                            <Card>
                              <CardContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">Name</p>
                                    <p className="text-muted-foreground">
                                      {appointment.coordinator.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-muted-foreground">
                                      {appointment.coordinator.email}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-muted-foreground">
                                      {appointment.coordinator.phone}
                                    </p>
                                  </div>
                                </div>
                                {appointment.coordinator.office && (
                                  <div className="mt-4">
                                    <p className="font-medium mb-2">Office Details</p>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="font-medium">Name</p>
                                        <p className="text-muted-foreground">
                                          {appointment.coordinator.office.name}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Address</p>
                                        <p className="text-muted-foreground">
                                          {appointment.coordinator.office.address}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Contact</p>
                                        <p className="text-muted-foreground">
                                          {appointment.coordinator.office.phone}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-muted-foreground">
                                          {appointment.coordinator.office.email}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                          <TabsContent value="notifications">
                            <Card>
                              <CardContent className="pt-4">
                                <ScrollArea className="h-[400px] pr-4">
                                  <div className="space-y-4">
                                    {appointment.notifications && appointment.notifications.length > 0 ? (
                                      appointment.notifications.map((notification) => (
                                        <Card key={notification.id}>
                                          <CardHeader>
                                            <div className="flex justify-between items-center">
                                              <CardTitle className="text-base">
                                                {notification.title}
                                              </CardTitle>
                                              <Badge>{notification.type}</Badge>
                                            </div>
                                            <CardDescription>
                                              {format(
                                                new Date(notification.createdAt),
                                                'PPP p'
                                              )}
                                            </CardDescription>
                                          </CardHeader>
                                          <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                              {notification.message}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      ))
                                    ) : (
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground">No notifications available</p>
                                      </div>
                                    )}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 
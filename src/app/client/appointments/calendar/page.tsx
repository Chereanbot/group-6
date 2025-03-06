"use client";

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday, differenceInDays, differenceInHours, isAfter, isBefore, addHours } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Flame
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: string;
  notes?: string;
  caseType: string;
  venue?: string;
  priority: string;
  requiredDocuments: string[];
  coordinator: {
    id: string;
    name: string;
    email: string;
    phone: string;
    office?: {
      name: string;
      location: string;
      address: string;
      phone: string;
      email: string;
    } | null;
  };
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/appointments', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.scheduledTime), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickAction = async (appointmentId: string, action: 'cancel' | 'complete') => {
    try {
      const response = await fetch(`/api/client/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: action === 'cancel' ? 'CANCELLED' : 'COMPLETED'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      await fetchAppointments();
      toast({
        title: "Success",
        description: `Appointment ${action === 'cancel' ? 'cancelled' : 'marked as completed'} successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const getAppointmentMessage = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = parseISO(appointment.scheduledTime);
    const daysUntil = differenceInDays(appointmentTime, now);
    const hoursUntil = differenceInHours(appointmentTime, now);
    
    if (isAfter(now, appointmentTime)) {
      return { message: "Appointment has passed", type: "past" };
    }
    
    if (daysUntil === 0 && hoursUntil <= 2) {
      return { 
        message: "Your appointment is very soon! Please be ready!", 
        type: "urgent",
        icon: <Flame className="h-4 w-4 text-red-500 animate-pulse" />
      };
    }
    
    if (daysUntil === 0) {
      return { 
        message: `Your appointment is in ${hoursUntil} hours!`,
        type: "today",
        icon: <Flame className="h-4 w-4 text-orange-500" />
      };
    }
    
    if (daysUntil === 1) {
      return { 
        message: "Your appointment is tomorrow! Get your documents ready.",
        type: "tomorrow"
      };
    }
    
    if (daysUntil <= 3) {
      return { 
        message: `${daysUntil} days until your appointment. Start preparing!`,
        type: "upcoming"
      };
    }
    
    return { 
      message: `Appointment scheduled in ${daysUntil} days`,
      type: "scheduled"
    };
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}

            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            <AnimatePresence>
              {days.map(day => {
                const dayAppointments = getAppointmentsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodays = isToday(day);

                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`aspect-square p-2 border rounded-lg ${
                      isCurrentMonth 
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                    } ${
                      isTodays ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : ''
                    } hover:border-primary dark:hover:border-primary transition-all cursor-pointer relative group`}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="text-right mb-2 flex justify-between items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              isTodays
                                ? 'bg-primary text-white'
                                : isCurrentMonth 
                                  ? 'text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {format(day, 'd')}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(day, 'EEEE, MMMM d, yyyy')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {dayAppointments.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {dayAppointments.length}
                        </Badge>
                      )}
                    </div>

                    {dayAppointments.length > 0 && (
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map(apt => {
                          const appointmentInfo = getAppointmentMessage(apt);
                          return (
                            <HoverCard key={apt.id}>
                              <HoverCardTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className={cn(
                                    "p-2 rounded text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col gap-1 group",
                                    {
                                      'bg-red-50 dark:bg-red-900/20': appointmentInfo.type === 'urgent',
                                      'bg-orange-50 dark:bg-orange-900/20': appointmentInfo.type === 'today',
                                      'bg-yellow-50 dark:bg-yellow-900/20': appointmentInfo.type === 'tomorrow',
                                      'bg-blue-50 dark:bg-blue-900/20': appointmentInfo.type === 'upcoming',
                                      'bg-gray-50 dark:bg-gray-900/20': appointmentInfo.type === 'scheduled',
                                      'bg-gray-100 dark:bg-gray-800/40': appointmentInfo.type === 'past'
                                    }
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                      <Badge className={`${getStatusColor(apt.status)} dark:bg-opacity-20 shrink-0`} />
                                      <span className="truncate text-gray-700 dark:text-gray-300">{apt.purpose}</span>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSelectedAppointment(apt)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Details
                                        </DropdownMenuItem>
                                        {apt.status === 'SCHEDULED' && (
                                          <>
                                            <DropdownMenuItem onClick={() => handleQuickAction(apt.id, 'complete')}>
                                              <CheckCircle className="mr-2 h-4 w-4" />
                                              Mark as Completed
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleQuickAction(apt.id, 'cancel')}>
                                              <XCircle className="mr-2 h-4 w-4" />
                                              Cancel Appointment
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    {appointmentInfo.icon}
                                    <span className={cn(
                                      "font-medium",
                                      {
                                        'text-red-600 dark:text-red-400': appointmentInfo.type === 'urgent',
                                        'text-orange-600 dark:text-orange-400': appointmentInfo.type === 'today',
                                        'text-yellow-600 dark:text-yellow-400': appointmentInfo.type === 'tomorrow',
                                        'text-blue-600 dark:text-blue-400': appointmentInfo.type === 'upcoming',
                                        'text-gray-600 dark:text-gray-400': appointmentInfo.type === 'scheduled',
                                        'text-gray-500 dark:text-gray-500': appointmentInfo.type === 'past'
                                      }
                                    )}>
                                      {appointmentInfo.message}
                                    </span>
                                  </div>
                                </motion.div>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{format(parseISO(apt.scheduledTime), 'PPp')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{apt.duration} minutes</span>
                                  </div>
                                  {apt.venue && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm">{apt.venue}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{apt.coordinator.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{apt.coordinator.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{apt.coordinator.email}</span>
                                  </div>
                                  {apt.requiredDocuments.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm">{apt.requiredDocuments.length} required documents</span>
                                    </div>
                                  )}
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          );
                        })}
                        {dayAppointments.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            onClick={() => {
                              const firstAppointment = dayAppointments[0];
                              setSelectedAppointment(firstAppointment);
                            }}
                          >
                            +{dayAppointments.length - 2} more
                          </Button>
                        )}
                      </div>
                    )}

                    {dayAppointments.length > 0 && (
                      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Appointment Information</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium">Date & Time:</span> {format(parseISO(selectedAppointment.scheduledTime), 'PPp')}</p>
                  <p><span className="font-medium">Duration:</span> {selectedAppointment.duration} minutes</p>
                  <p><span className="font-medium">Purpose:</span> {selectedAppointment.purpose}</p>
                  <p><span className="font-medium">Case Type:</span> {selectedAppointment.caseType}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={`${getStatusColor(selectedAppointment.status)} dark:bg-opacity-20`}>
                      {selectedAppointment.status}
                    </Badge>
                    <Badge className={`${getPriorityColor(selectedAppointment.priority)} dark:bg-opacity-20`}>
                      {selectedAppointment.priority}
                    </Badge>
                  </div>
                  <p><span className="font-medium">Venue:</span> {selectedAppointment.venue || 'N/A'}</p>
                  {selectedAppointment.notes && (
                    <p><span className="font-medium">Notes:</span> {selectedAppointment.notes}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Coordinator Information</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium">Name:</span> {selectedAppointment.coordinator.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedAppointment.coordinator.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedAppointment.coordinator.phone}</p>
                  {selectedAppointment.coordinator.office && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4"
                    >
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Office Details</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {selectedAppointment.coordinator.office.name}</p>
                        <p><span className="font-medium">Location:</span> {selectedAppointment.coordinator.office.location}</p>
                        <p><span className="font-medium">Address:</span> {selectedAppointment.coordinator.office.address}</p>
                        <p><span className="font-medium">Phone:</span> {selectedAppointment.coordinator.office.phone}</p>
                        <p><span className="font-medium">Email:</span> {selectedAppointment.coordinator.office.email}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              {selectedAppointment.requiredDocuments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="col-span-2"
                >
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Required Documents</h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    {selectedAppointment.requiredDocuments.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
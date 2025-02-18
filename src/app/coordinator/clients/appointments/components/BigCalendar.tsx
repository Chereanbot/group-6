"use client";

import { useState, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, addWeeks, subDays, subWeeks, addMonths, subMonths, isSameMonth } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client: {
    id: string;
    name: string;
    fullName: string;
    email: string;
    phone: string;
    clientProfile?: {
      region: string;
      zone: string;
      wereda: string;
      kebele: string;
      caseType: string;
      caseCategory: string;
    };
  };
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: string;
  notes?: string;
  caseType: string;
  venue: string;
  priority: string;
}

interface BigCalendarProps {
  appointments: Appointment[];
  onUpdateStatus: (appointmentId: string, newStatus: string) => Promise<void>;
  onDeleteAppointment: (appointmentId: string) => Promise<void>;
}

export default function BigCalendar({
  appointments,
  onUpdateStatus,
  onDeleteAppointment,
}: BigCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const handleViewModeChange = (mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
    // Reset date range based on mode
    if (mode === 'day') {
      setCurrentDate(new Date());
    }
  };

  const getDateRange = () => {
    switch (viewMode) {
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate)
        };
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        };
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
    }
  };

  const filterAppointmentsByTime = (appointments: Appointment[]) => {
    return appointments.filter(apt => {
      const hour = new Date(apt.start).getHours();
      switch (timeFilter) {
        case 'morning':
          return hour >= 6 && hour < 12;
        case 'afternoon':
          return hour >= 12 && hour < 17;
        case 'evening':
          return hour >= 17 && hour < 22;
        default:
          return true;
      }
    });
  };

  const days = eachDayOfInterval(getDateRange());

  const getAppointmentsForDay = (date: Date) => {
    const dayAppointments = appointments.filter((appointment) =>
      isSameDay(new Date(appointment.start), date)
    );
    return filterAppointmentsByTime(dayAppointments);
  };

  const handleSendNotification = async () => {
    if (!selectedEvent || !notificationMessage.trim()) return;

    try {
      const response = await fetch("/api/coordinator/clients/appointments/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: selectedEvent.id,
          message: notificationMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      setNotificationMessage("");
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "HIGH":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('month')}
            >
              Month
            </Button>
          </div>
          <Select
            value={timeFilter}
            onValueChange={(value: any) => setTimeFilter(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Times</SelectItem>
              <SelectItem value="morning">Morning (6-12)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12-5)</SelectItem>
              <SelectItem value="evening">Evening (5-10)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              switch (viewMode) {
                case 'day':
                  setCurrentDate(subDays(currentDate, 1));
                  break;
                case 'week':
                  setCurrentDate(subWeeks(currentDate, 1));
                  break;
                case 'month':
                  setCurrentDate(subMonths(currentDate, 1));
                  break;
              }
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              switch (viewMode) {
                case 'day':
                  setCurrentDate(addDays(currentDate, 1));
                  break;
                case 'week':
                  setCurrentDate(addWeeks(currentDate, 1));
                  break;
                case 'month':
                  setCurrentDate(addMonths(currentDate, 1));
                  break;
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted">
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const hasAppointments = dayAppointments.length > 0;
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] bg-background p-2",
                isToday(day) && "ring-2 ring-primary",
                hasAppointments && "bg-blue-50 dark:bg-blue-900/10",
                !isSameMonth(day, currentDate) && "opacity-50"
              )}
            >
              <div className="text-sm font-medium mb-1 flex justify-between items-center">
                <span>{format(day, "d")}</span>
                {hasAppointments && (
                  <Badge variant="secondary" className="text-xs">
                    {dayAppointments.length}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 max-h-[80px] overflow-auto">
                {dayAppointments.map((appointment) => (
                  <motion.button
                    key={appointment.id}
                    onClick={() => setSelectedEvent(appointment)}
                    className={cn(
                      "w-full text-left p-1 rounded-md text-xs transition-colors",
                      "hover:bg-muted group relative"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-1">
                      <Badge className={getStatusColor(appointment.status)}>
                        {format(new Date(appointment.start), "HH:mm")}
                      </Badge>
                      <span className="truncate">{appointment.client.name}</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-gray-800/90 p-2 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-medium">Click for details</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Appointment Details</DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                    <Badge
                      variant={
                        selectedEvent.status === "completed"
                          ? "default"
                          : selectedEvent.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {selectedEvent.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Client: {selectedEvent.client.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {selectedEvent.client.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Venue: {selectedEvent.venue}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Purpose: {selectedEvent.purpose}
                  </p>
                  {selectedEvent.notes && (
                    <p className="text-sm text-muted-foreground">
                      Notes: {selectedEvent.notes}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Send Notification</h4>
                  <Textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="h-20"
                  />
                  <Button
                    onClick={handleSendNotification}
                    disabled={!notificationMessage.trim()}
                    className="w-full"
                  >
                    Send Notification
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      onUpdateStatus(
                        selectedEvent.id,
                        selectedEvent.status === "completed" ? "scheduled" : "completed"
                      )
                    }
                  >
                    Mark as {selectedEvent.status === "completed" ? "Scheduled" : "Completed"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDeleteAppointment(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
} 
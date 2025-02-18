"use client";

import { useState } from 'react';
import { format, parseISO, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ArrowDownUp,
} from "lucide-react";

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

interface TableViewProps {
  appointments: Appointment[];
  onUpdateStatus: (appointmentId: string, newStatus: string) => Promise<void>;
  onDeleteAppointment: (appointmentId: string) => Promise<void>;
}

export default function TableView({
  appointments,
  onUpdateStatus,
  onDeleteAppointment,
}: TableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "priority" | "client">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSendNotification = async () => {
    if (!selectedAppointment || !notificationMessage.trim()) return;

    try {
      const response = await fetch('/api/coordinator/clients/appointments/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          message: notificationMessage,
        })
      });

      if (!response.ok) throw new Error('Failed to send notification');

      setNotificationMessage('');
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const filteredAppointments = appointments
    .filter((appointment) => {
      const searchString = searchTerm.toLowerCase();
      const matchesSearch =
        appointment.client.name.toLowerCase().includes(searchString) ||
        appointment.client.email.toLowerCase().includes(searchString) ||
        appointment.purpose.toLowerCase().includes(searchString) ||
        appointment.venue.toLowerCase().includes(searchString);

      const matchesStatus =
        statusFilter === "all" || appointment.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "all" ||
        appointment.priority.toLowerCase() === priorityFilter.toLowerCase();

      const appointmentDate = new Date(appointment.start);
      const today = new Date();
      let matchesDate = true;

      switch (dateFilter) {
        case "today":
          matchesDate = isSameDay(appointmentDate, today);
          break;
        case "week":
          matchesDate = isWithinInterval(appointmentDate, {
            start: startOfWeek(today),
            end: endOfWeek(today),
          });
          break;
        case "month":
          matchesDate = isWithinInterval(appointmentDate, {
            start: startOfMonth(today),
            end: endOfMonth(today),
          });
          break;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.start).getTime() - new Date(b.start).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "priority":
          comparison = a.priority.localeCompare(b.priority);
          break;
        case "client":
          comparison = a.client.name.localeCompare(b.client.name);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={dateFilter} 
            onValueChange={(value: "all" | "today" | "week" | "month") => setDateFilter(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={sortBy} 
            onValueChange={(value: "date" | "status" | "priority" | "client") => setSortBy(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="client">Client Name</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="hover:bg-muted"
          >
            {sortOrder === "asc" ? (
              <ArrowUpDown className="h-4 w-4" />
            ) : (
              <ArrowDownUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Details</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredAppointments.map((appointment) => (
                <motion.tr
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="group hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium">{appointment.client.name}</span>
                      <span className="text-sm text-muted-foreground">{appointment.client.email}</span>
                      <span className="text-sm text-muted-foreground">{appointment.client.phone}</span>
                      {appointment.client.clientProfile && (
                        <Badge variant="outline" className="w-fit">
                          {appointment.client.clientProfile.caseType}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium">
                        {format(new Date(appointment.start), "PPP")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(appointment.start), "p")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Duration: {appointment.duration} minutes
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="capitalize"
                      variant={
                        appointment.status.toLowerCase() === "completed"
                          ? "default"
                          : appointment.status.toLowerCase() === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="capitalize"
                      variant={
                        appointment.priority.toLowerCase() === "urgent"
                          ? "destructive"
                          : appointment.priority.toLowerCase() === "high"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {appointment.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-2">{appointment.purpose}</span>
                  </TableCell>
                  <TableCell>{appointment.venue}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Send Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Notification</DialogTitle>
                            <DialogDescription>
                              Send a message to {appointment.client.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Textarea
                              placeholder="Type your message here..."
                              value={notificationMessage}
                              onChange={(e) => setNotificationMessage(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <Button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                handleSendNotification();
                              }}
                              className="w-full"
                            >
                              Send Notification
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Select
                        value={appointment.status.toLowerCase()}
                        onValueChange={(value) => onUpdateStatus(appointment.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteAppointment(appointment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <AnimatePresence>
        {selectedAppointment && (
          <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-medium mb-2">To: {selectedAppointment.client.name}</h4>
                  <Textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="h-32"
                  />
                </div>
                <Button
                  onClick={handleSendNotification}
                  disabled={!notificationMessage.trim()}
                  className="w-full"
                >
                  Send Notification
                </Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
} 
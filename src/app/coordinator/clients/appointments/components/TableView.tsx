"use client";

import { useState, useMemo } from 'react';
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
import { Search, MoreVertical, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Filter, Download, Trash2, Mail, Calendar, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

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
  cancellationReason?: string;
  completionNotes?: string;
}

interface TableViewProps {
  appointments: Appointment[];
  onUpdateStatus: (appointmentId: string, status: string) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onOpenStatusDialog: (appointment: Appointment) => void;
}

const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED'
} as const;

const getStatusColor = (status: string) => {
  switch (status) {
    case APPOINTMENT_STATUS.SCHEDULED:
      return 'bg-blue-100 text-blue-800';
    case APPOINTMENT_STATUS.CONFIRMED:
      return 'bg-green-100 text-green-800';
    case APPOINTMENT_STATUS.CANCELLED:
      return 'bg-red-100 text-red-800';
    case APPOINTMENT_STATUS.COMPLETED:
      return 'bg-blue-100 text-blue-800';
    case APPOINTMENT_STATUS.NO_SHOW:
      return 'bg-yellow-100 text-yellow-800';
    case APPOINTMENT_STATUS.RESCHEDULED:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case APPOINTMENT_STATUS.CONFIRMED:
    case APPOINTMENT_STATUS.COMPLETED:
      return <CheckCircle className="h-4 w-4 mr-1" />;
    case APPOINTMENT_STATUS.CANCELLED:
      return <XCircle className="h-4 w-4 mr-1" />;
    case APPOINTMENT_STATUS.NO_SHOW:
      return <Clock className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

const ITEMS_PER_PAGE = 10;

export default function TableView({
  appointments,
  onUpdateStatus,
  onDeleteAppointment,
  onOpenStatusDialog
}: TableViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Appointment>("start");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

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

  const handleBulkAction = async (action: 'delete' | 'notify') => {
    if (selectedAppointments.size === 0) {
      toast.error("Please select at least one appointment");
      return;
    }

    if (action === 'delete') {
      setDeleteDialogOpen(true);
    } else if (action === 'notify') {
      setSelectedAppointment(appointments.find(apt => apt.id === Array.from(selectedAppointments)[0]) || null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedAppointments).map(id => onDeleteAppointment(id))
      );
      setSelectedAppointments(new Set());
      toast.success("Selected appointments deleted successfully");
    } catch (error) {
      toast.error("Failed to delete some appointments");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const searchString = searchQuery.toLowerCase();
      const matchesSearch =
        appointment.client.name.toLowerCase().includes(searchString) ||
        appointment.client.email.toLowerCase().includes(searchString) ||
        appointment.purpose.toLowerCase().includes(searchString) ||
        appointment.venue.toLowerCase().includes(searchString);

      const matchesStatus =
        statusFilter === "all" || appointment.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "all" || appointment.priority.toLowerCase() === priorityFilter.toLowerCase();

      const appointmentDate = new Date(appointment.start);
      let matchesDate = true;

      switch (dateRange) {
        case "today":
          matchesDate = isSameDay(appointmentDate, new Date());
          break;
        case "week":
          matchesDate = isWithinInterval(appointmentDate, {
            start: startOfWeek(new Date()),
            end: endOfWeek(new Date()),
          });
          break;
        case "month":
          matchesDate = isWithinInterval(appointmentDate, {
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date()),
          });
          break;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, priorityFilter, dateRange]);

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredAppointments, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedAppointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAppointments = sortedAppointments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSelectAll = () => {
    if (selectedAppointments.size === paginatedAppointments.length) {
      setSelectedAppointments(new Set());
    } else {
      setSelectedAppointments(new Set(paginatedAppointments.map(apt => apt.id)));
    }
  };

  const handleSelectAppointment = (id: string) => {
    const newSelected = new Set(selectedAppointments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAppointments(newSelected);
  };

  const handleSort = (field: keyof Appointment) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {selectedAppointments.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions ({selectedAppointments.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('notify')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Notification
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg"
          >
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(APPOINTMENT_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={(value: "all" | "today" | "week" | "month") => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-md border">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedAppointments.size === paginatedAppointments.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("start")}
                >
                  <div className="flex items-center gap-2">
                    Date & Time
                    {sortField === "start" && (
                      sortDirection === "asc" ? <ArrowUpDown className="h-4 w-4" /> : <ArrowDownUp className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("client")}
                >
                  <div className="flex items-center gap-2">
                    Client
                    {sortField === "client" && (
                      sortDirection === "asc" ? <ArrowUpDown className="h-4 w-4" /> : <ArrowDownUp className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAppointments.has(appointment.id)}
                      onCheckedChange={() => handleSelectAppointment(appointment.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {format(new Date(appointment.start), "MMM d, yyyy h:mm a")}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Duration: {appointment.duration} minutes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{appointment.client.fullName}</span>
                      <span className="text-sm text-muted-foreground">{appointment.client.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.purpose}</TableCell>
                  <TableCell>{appointment.venue}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{appointment.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenStatusDialog(appointment)}
                            >
                              Update Status
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Update appointment status</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setAppointmentToDelete(appointment);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete appointment</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedAppointments.length)} of {sortedAppointments.length} appointments
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {appointmentToDelete
                ? `This will delete the appointment with ${appointmentToDelete.client.fullName}`
                : `This will delete ${selectedAppointments.size} selected appointments`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
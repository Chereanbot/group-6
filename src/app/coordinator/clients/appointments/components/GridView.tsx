import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Bell,
  Send,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface GridViewProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
}

export default function GridView({ appointments, onUpdateStatus, onDeleteAppointment }: GridViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

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
          clientId: selectedAppointment.client.id,
          message: notificationMessage,
          type: 'APPOINTMENT_UPDATE'
        })
      });

      if (!response.ok) throw new Error('Failed to send notification');

      toast.success('Notification sent successfully');
      setNotificationMessage('');
      setShowNotificationModal(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "HIGH":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAppointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl 
                border border-gray-200 dark:border-gray-700 hover:shadow-2xl 
                hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {appointment.client.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">{appointment.client.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowNotificationModal(true);
                      }}
                      className="flex items-center"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notify Client
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(appointment.id, 'COMPLETED')}
                      className="flex items-center"
                      disabled={appointment.status === 'COMPLETED'}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(appointment.id, 'CANCELLED')}
                      className="flex items-center"
                      disabled={appointment.status === 'CANCELLED'}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteAppointment(appointment.id)}
                      className="flex items-center text-red-600"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{format(parseISO(appointment.scheduledTime), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{format(parseISO(appointment.scheduledTime), 'HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{appointment.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{appointment.client.phone}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {appointment.purpose}
                </p>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  <Badge className={getPriorityColor(appointment.priority)}>
                    {appointment.priority}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showNotificationModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl 
                border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Send Notification
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotificationModal(false)}
                  className="hover:bg-red-50 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <Textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter your message here..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNotificationModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendNotification}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    disabled={!notificationMessage.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
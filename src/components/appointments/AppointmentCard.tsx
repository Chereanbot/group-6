"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  MapPin,
  Video,
  AlertCircle,
  Calendar,
  User,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Appointment } from "@/app/lawyer/communications/appointments/interfaces";
import { toast } from "sonner";

interface AppointmentCardProps {
  appointment: Appointment;
}

const statusColors = {
  SCHEDULED: "bg-blue-500",
  CONFIRMED: "bg-green-500",
  COMPLETED: "bg-gray-500",
  CANCELLED: "bg-red-500",
  RESCHEDULED: "bg-yellow-500",
  NO_SHOW: "bg-orange-500"
} as const;

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: Appointment['status']) => {
    try {
      setIsLoading(true);
      // Add API call here
      toast.success(`Appointment ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to update appointment status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {appointment.title}
              <Badge 
                variant="secondary"
                className={cn("text-white", statusColors[appointment.status])}
              >
                {appointment.status}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(appointment.startTime), "h:mm a")} - 
                {format(new Date(appointment.endTime), "h:mm a")}
              </div>
              {appointment.isVirtual ? (
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  Virtual Meeting
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {appointment.location}
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('CONFIRMED')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('COMPLETED')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('CANCELLED')}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {appointment.client.fullName}
            </div>
            {appointment.case && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Case: {appointment.case.caseNumber}
              </div>
            )}
          </div>
          {appointment.description && (
            <p className="text-sm text-muted-foreground">
              {appointment.description}
            </p>
          )}
          {appointment.isVirtual && appointment.meetingLink && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(appointment.meetingLink, '_blank')}
            >
              <Video className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
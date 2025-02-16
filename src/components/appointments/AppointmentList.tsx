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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock,
  MapPin,
  Video,
  AlertCircle,
  Calendar,
  User,
  FileText,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Appointment } from "@/app/lawyer/communications/appointments/interfaces";
import { AppointmentCard } from "./AppointmentCard";

interface AppointmentListProps {
  selectedDate: Date;
}

export function AppointmentList({ selectedDate }: AppointmentListProps) {
  // Mock data - replace with real API call
  const appointments: Appointment[] = [];

  const todayAppointments = appointments.filter(
    appointment => isSameDay(new Date(appointment.startTime), selectedDate)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Appointments for {format(selectedDate, "MMMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No appointments scheduled for this day
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 
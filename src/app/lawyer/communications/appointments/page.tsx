"use client";

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Calendar as CalendarIcon,
  List,
  Clock,
  MapPin,
  Video,
  AlertCircle,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { AppointmentCalendarView } from "@/components/appointments/AppointmentCalendarView";
import { useTheme } from "next-themes";
import { Appointment } from "./interfaces";

type ViewMode = "calendar" | "list";

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { theme } = useTheme();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
          
          <div className="space-y-2">
            <h3 className="font-medium">Upcoming Today</h3>
            <ScrollArea className="h-[300px]">
              {/* Add upcoming appointments list */}
            </ScrollArea>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          {viewMode === "calendar" ? (
            <AppointmentCalendarView 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          ) : (
            <AppointmentList 
              selectedDate={selectedDate}
            />
          )}
        </div>
      </div>
    </div>
  );
} 
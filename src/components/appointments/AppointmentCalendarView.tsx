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
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  AlertCircle
} from "lucide-react";
import { format, addDays, startOfWeek, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Appointment } from "@/app/lawyer/communications/appointments/interfaces";

interface AppointmentCalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AppointmentCalendarView({ 
  selectedDate,
  onDateSelect 
}: AppointmentCalendarViewProps) {
  const weekStart = startOfWeek(selectedDate);
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>
          {format(selectedDate, "MMMM yyyy")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateSelect(addDays(selectedDate, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateSelect(addDays(selectedDate, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-4">
          {/* Time column */}
          <div className="space-y-4">
            <div className="h-8" /> {/* Header spacer */}
            {HOURS.map((hour) => (
              <div 
                key={hour}
                className="h-20 text-sm text-muted-foreground"
              >
                {format(new Date().setHours(hour), "ha")}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDays.map((date) => (
            <div key={date.toString()} className="space-y-4">
              <Button
                variant={date.getDate() === selectedDate.getDate() ? "default" : "ghost"}
                className="w-full"
                onClick={() => onDateSelect(date)}
              >
                <div className="text-center">
                  <div className="text-sm font-medium">
                    {WEEK_DAYS[date.getDay()]}
                  </div>
                  <div className="text-lg">
                    {format(date, "d")}
                  </div>
                </div>
              </Button>

              {/* Time slots */}
              {HOURS.map((hour) => (
                <div 
                  key={hour}
                  className="h-20 border-l first:border-l-0 relative"
                >
                  {/* Add appointment slots here */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
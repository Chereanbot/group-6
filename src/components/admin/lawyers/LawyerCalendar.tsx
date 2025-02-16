import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'HEARING' | 'APPOINTMENT' | 'MEETING' | 'DEADLINE';
  lawyerId: string;
}

interface LawyerCalendarProps {
  events: Event[];
  lawyers: Array<{
    id: string;
    fullName: string;
  }>;
}

export function LawyerCalendar({ events, lawyers }: LawyerCalendarProps) {
  const [selectedLawyer, setSelectedLawyer] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter events based on selected lawyer and date
  const filteredEvents = events.filter(event => {
    const isSameLawyer = selectedLawyer === 'all' || event.lawyerId === selectedLawyer;
    const eventDate = new Date(event.start);
    const isSameDate = eventDate.toDateString() === selectedDate.toDateString();
    return isSameLawyer && isSameDate;
  });

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'HEARING':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'APPOINTMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'MEETING':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'DEADLINE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-medium">Lawyer Calendar</h3>
        <Select
          value={selectedLawyer}
          onValueChange={setSelectedLawyer}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Lawyer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lawyers</SelectItem>
            {lawyers.map(lawyer => (
              <SelectItem key={lawyer.id} value={lawyer.id}>
                {lawyer.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-4">Events for {selectedDate.toLocaleDateString()}</h4>
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <p className="text-muted-foreground">No events scheduled for this date</p>
            ) : (
              filteredEvents.map(event => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{event.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 
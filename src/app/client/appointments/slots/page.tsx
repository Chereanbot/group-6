"use client";

import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/providers/LanguageProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MapPin, User } from 'lucide-react';

interface Coordinator {
  id: string;
  name: string;
  office: {
    name: string;
    address: string;
  } | null;
}

interface Slot {
  startTime: string;
  endTime: string;
  coordinator: Coordinator;
}

interface GroupedSlots {
  [date: string]: Slot[];
}

export default function AppointmentSlots() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<GroupedSlots>({});
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>('');

  useEffect(() => {
    fetchSlots();
  }, [selectedDate, selectedCoordinator]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: selectedDate.toISOString(),
        days: '7',
        ...(selectedCoordinator && { coordinatorId: selectedCoordinator }),
      });

      const response = await fetch(`/api/client/appointments/slots?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }

      const data = await response.json();
      if (data.success) {
        setSlots(data.data.slots);
        setCoordinators(data.data.coordinators);
      } else {
        throw new Error(data.message || 'Failed to fetch slots');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, j) => (
                <Skeleton key={j} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const handleSlotSelect = (slot: Slot) => {
    // Navigate to appointment booking page with selected slot
    window.location.href = `/client/appointments/new?startTime=${encodeURIComponent(slot.startTime)}&coordinatorId=${slot.coordinator.id}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-4xl font-bold">Available Appointment Slots</h1>
          <p className="text-muted-foreground">
            Select your preferred date and coordinator to view available slots
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Customize your slot search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date Range</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) =>
                    date < new Date() || // Can't select past dates
                    date > addDays(new Date(), 30) || // Can't select dates more than 30 days in future
                    [0, 6].includes(date.getDay()) // Can't select weekends
                  }
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Coordinator</label>
                <Select value={selectedCoordinator} onValueChange={setSelectedCoordinator}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Coordinators" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coordinators</SelectItem>
                    {coordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={coordinator.id}>
                        {coordinator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderSkeleton()}
            </motion.div>
          ) : Object.keys(slots).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No available slots found</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {Object.entries(slots).map(([date, daySlots]) => (
                <Card key={date} className={isSameDay(new Date(date), selectedDate) ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <CardTitle>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</CardTitle>
                    <CardDescription>{daySlots.length} available slots</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {daySlots.map((slot, index) => (
                          <motion.div
                            key={`${slot.startTime}-${slot.coordinator.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1,
                              y: 0,
                              transition: { delay: index * 0.05 }
                            }}
                          >
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleSlotSelect(slot)}>
                              <CardContent className="p-4 space-y-4">
                                <div className="flex items-center space-x-2 text-primary">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {format(new Date(slot.startTime), 'h:mm a')}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-start space-x-2">
                                    <User className="h-4 w-4 mt-1" />
                                    <div>
                                      <p className="font-medium">{slot.coordinator.name}</p>
                                      {slot.coordinator.office && (
                                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          <span>{slot.coordinator.office.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button className="w-full" variant="secondary">
                                  Select Slot
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
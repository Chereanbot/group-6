'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell,
  User,
  FileText,
  UserCog,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Flame,
  Siren
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface Coordinator {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface NewAppointmentFormProps {
  clients: Client[];
  coordinators: Coordinator[];
}

const appointmentSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  coordinatorId: z.string().min(1, 'Please select a coordinator'),
  scheduledTime: z.date().min(new Date(), 'Appointment time must be in the future'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 4 hours'),
  purpose: z.string().min(10, 'Please provide a detailed purpose'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  venue: z.string().optional(),
  notes: z.string().optional(),
  reminderType: z.array(z.enum(['EMAIL', 'SMS', 'WHATSAPP'])).default(['EMAIL']),
  reminderTiming: z.array(z.number()).default([24, 1])
});

type FormData = z.infer<typeof appointmentSchema>;

export default function NewAppointmentForm({ clients, coordinators }: NewAppointmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: 60,
      priority: 'MEDIUM',
      reminderType: ['EMAIL'],
      reminderTiming: [24, 1]
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lawyer/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create appointment');
      }

      toast.success('Appointment scheduled successfully');
      router.push('/lawyer/appointments');
      router.refresh();
    } catch (error) {
      toast.error(error.message || 'Failed to schedule appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityConfig = {
    LOW: {
      icon: CheckCircle2,
      label: 'Low Priority',
      description: 'Regular follow-up or routine matter',
      color: 'text-green-500'
    },
    MEDIUM: {
      icon: AlertCircle,
      label: 'Medium Priority',
      description: 'Important but not time-sensitive',
      color: 'text-blue-500'
    },
    HIGH: {
      icon: Flame,
      label: 'High Priority',
      description: 'Time-sensitive or critical matter',
      color: 'text-orange-500'
    },
    URGENT: {
      icon: Siren,
      label: 'Urgent',
      description: 'Requires immediate attention',
      color: 'text-red-500'
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedClient(clients.find(c => c.id === value) || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a client">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{clients.find(c => c.id === field.value)?.fullName || 'Select a client'}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <div>{client.fullName}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the client for this appointment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coordinatorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinator</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a coordinator">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4" />
                        <span>
                          {coordinators.find(c => c.id === field.value)?.fullName || 'Select a coordinator'}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {coordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={coordinator.id}>
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          <div>
                            <div>{coordinator.fullName}</div>
                            <div className="text-sm text-gray-500">{coordinator.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Assign a coordinator for this appointment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date and Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP p")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date.getDay() === 0 || date.getDay() === 6
                      }
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(field.value || new Date());
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          field.onChange(newDate);
                        }}
                        className="w-full"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select a date and time for the appointment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <FormDescription>
                  Specify the duration in minutes (15-240)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority">
                      <div className="flex items-center gap-2">
                        {field.value && (
                          <div className={`flex items-center gap-2 ${priorityConfig[field.value].color}`}>
                            {React.createElement(priorityConfig[field.value].icon, { className: "h-4 w-4" })}
                            <span>{priorityConfig[field.value].label}</span>
                          </div>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {React.createElement(config.icon, { className: `h-4 w-4 ${config.color}` })}
                          <div>
                            <div className={config.color}>{config.label}</div>
                            <div className="text-sm text-gray-500">{config.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Set the priority level for this appointment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose</FormLabel>
                <Textarea
                  {...field}
                  placeholder="Describe the purpose of this appointment"
                />
                <FormDescription>
                  Provide a clear description of the appointment's purpose
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue (Optional)</FormLabel>
                <Input {...field} placeholder="Meeting location or video call link" />
                <FormDescription>
                  Specify the meeting location or provide a video call link
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reminderType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Type</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {(['EMAIL', 'SMS', 'WHATSAPP'] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={field.value.includes(type) ? "default" : "outline"}
                      onClick={() => {
                        const newValue = field.value.includes(type)
                          ? field.value.filter(t => t !== type)
                          : [...field.value, type];
                        field.onChange(newValue);
                      }}
                      className="px-3 py-1"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {type}
                    </Button>
                  ))}
                </div>
                <FormDescription>
                  Choose how to remind the client about the appointment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <Textarea
                {...field}
                placeholder="Any additional notes or instructions"
                className="min-h-[100px]"
              />
              <FormDescription>
                Add any additional information or special instructions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Appointment'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 
import { Appointment } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{appointment.type}</h4>
              <span className="text-sm text-gray-500">
                {format(new Date(appointment.scheduledFor), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(appointment.scheduledFor), 'h:mm a')} 
                  ({appointment.duration} mins)
                </span>
              </div>
              {appointment.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 
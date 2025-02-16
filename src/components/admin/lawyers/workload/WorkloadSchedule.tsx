import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'react-hot-toast';

interface WorkloadScheduleProps {
  schedules: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function WorkloadSchedule({ schedules, loading, onRefresh }: WorkloadScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedLawyer, setSelectedLawyer] = useState('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/lawyers/workload/schedules/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule status');
      }

      toast.success('Schedule status updated successfully');
      onRefresh();
    } catch (error) {
      console.error('Error updating schedule status:', error);
      toast.error('Failed to update schedule status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lawyers/workload/schedules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      toast.success('Schedule deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesLawyer = selectedLawyer === 'all' || schedule.lawyer.id === selectedLawyer;
    const matchesDate = selectedDate
      ? new Date(schedule.startTime).toDateString() === selectedDate.toDateString()
      : true;
    return matchesLawyer && matchesDate;
  });

  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={selectedLawyer}
              onValueChange={setSelectedLawyer}
            >
              <option value="all">All Lawyers</option>
              {/* Add lawyer options dynamically */}
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = '/admin/lawyers/workload/schedules/new'}
          >
            New Schedule
          </Button>
        </div>

        {viewMode === 'calendar' ? (
          <div className="flex gap-4">
            <div className="w-full max-w-sm">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="flex-1">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Lawyer</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          {new Date(schedule.startTime).toLocaleTimeString()} -{' '}
                          {new Date(schedule.endTime).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{schedule.lawyer.name}</TableCell>
                        <TableCell>{schedule.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              schedule.status === 'completed'
                                ? 'success'
                                : schedule.status === 'in_progress'
                                ? 'warning'
                                : schedule.status === 'cancelled'
                                ? 'destructive'
                                : 'default'
                            }
                          >
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                •••
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => window.location.href = `/admin/lawyers/workload/schedules/${schedule.id}`}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(schedule.id, 'completed')}
                                disabled={schedule.status === 'completed'}
                              >
                                Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                                disabled={schedule.status === 'cancelled'}
                              >
                                Cancel Schedule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(schedule.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSchedules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No schedules found for the selected date
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Lawyer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules
                  .filter((schedule) => selectedLawyer === 'all' || schedule.lawyer.id === selectedLawyer)
                  .map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        {new Date(schedule.startTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(schedule.startTime).toLocaleTimeString()} -{' '}
                        {new Date(schedule.endTime).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{schedule.lawyer.name}</TableCell>
                      <TableCell>{schedule.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            schedule.status === 'completed'
                              ? 'success'
                              : schedule.status === 'in_progress'
                              ? 'warning'
                              : schedule.status === 'cancelled'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => window.location.href = `/admin/lawyers/workload/schedules/${schedule.id}`}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(schedule.id, 'completed')}
                              disabled={schedule.status === 'completed'}
                            >
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                              disabled={schedule.status === 'cancelled'}
                            >
                              Cancel Schedule
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No schedules found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
} 
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
import { toast } from 'react-hot-toast';
import { WorkAssignment, WorkStatus, WorkType, ComplexityLevel } from '@/app/admin/lawyers/workload/page';

interface WorkloadAssignmentsProps {
  assignments: WorkAssignment[];
  loading: boolean;
  onRefresh: () => void;
}

const WORK_TYPES: WorkType[] = [
  'CASE_WORK',
  'RESEARCH',
  'DOCUMENT_REVIEW',
  'CLIENT_MEETING',
  'COURT_APPEARANCE',
  'ADMINISTRATIVE',
  'TRAINING'
];

const WORK_STATUSES: WorkStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'ON_HOLD',
  'CANCELLED'
];

const COMPLEXITY_LEVELS: ComplexityLevel[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'VERY_HIGH'
];

export function WorkloadAssignments({ assignments, loading, onRefresh }: WorkloadAssignmentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<WorkType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'complexity'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleStatusChange = async (id: string, newStatus: WorkStatus) => {
    try {
      const response = await fetch(`/api/admin/lawyers/workload/assignments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment status');
      }

      toast.success('Assignment status updated successfully');
      onRefresh();
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast.error('Failed to update assignment status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lawyers/workload/assignments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      toast.success('Assignment deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesSearch = 
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.case?.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      const matchesType = typeFilter === 'all' || assignment.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'dueDate') {
        aValue = new Date(a.dueDate).getTime();
        bValue = new Date(b.dueDate).getTime();
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
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
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as WorkStatus | 'all')}
          >
            <option value="all">All Status</option>
            {WORK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as WorkType | 'all')}
          >
            <option value="all">All Types</option>
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'dueDate' | 'priority' | 'complexity')}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="complexity">Complexity</option>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Lawyer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.lawyer.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {assignment.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        assignment.status === 'COMPLETED'
                          ? 'success'
                          : assignment.status === 'IN_PROGRESS'
                          ? 'warning'
                          : assignment.status === 'CANCELLED'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {assignment.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{assignment.complexity}</TableCell>
                  <TableCell>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${assignment.progress}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.dueDate).toLocaleDateString()}
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
                          onClick={() => window.location.href = `/admin/lawyers/workload/assignments/${assignment.id}`}
                        >
                          View Details
                        </DropdownMenuItem>
                        {WORK_STATUSES.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(assignment.id, status)}
                            disabled={assignment.status === status}
                          >
                            Mark as {status.replace('_', ' ')}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAssignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
} 
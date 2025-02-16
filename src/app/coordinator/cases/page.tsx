"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseStatus, Priority, CaseCategory } from '@prisma/client';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: Priority;
  category: CaseCategory;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  updatedAt: string;
  assignedOffice: {
    id: string;
    name: string;
    location?: string;
  };
}

export default function CoordinatorCasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');

  useEffect(() => {
    fetchCases();
  }, [statusFilter, priorityFilter, searchTerm]);

  const fetchCases = async () => {
    try {
      let url = '/api/coordinator/cases?';
      if (statusFilter && statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (priorityFilter && priorityFilter !== 'ALL') url += `priority=${priorityFilter}&`;
      if (searchTerm) url += `search=${searchTerm}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCases(data.data.cases);
      } else {
        console.error('Failed to fetch cases:', data.error);
        toast.error(data.error || 'Failed to fetch cases');
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'bg-red-500';
      case Priority.MEDIUM:
        return 'bg-yellow-500';
      case Priority.LOW:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.ACTIVE:
        return 'bg-blue-500';
      case CaseStatus.PENDING:
        return 'bg-yellow-500';
      case CaseStatus.CANCELLED:
        return 'bg-gray-500';
      case CaseStatus.RESOLVED:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cases Management</CardTitle>
              <CardDescription>Manage and track all legal cases</CardDescription>
            </div>
            <Button onClick={() => router.push('/coordinator/cases/new')}>
              Create New Case
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as CaseStatus | 'ALL')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value={CaseStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={CaseStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={CaseStatus.CANCELLED}>Cancelled</SelectItem>
                <SelectItem value={CaseStatus.RESOLVED}>Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as Priority | 'ALL')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value={Priority.HIGH}>High</SelectItem>
                <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={Priority.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((case_) => (
                <TableRow key={case_.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/coordinator/cases/${case_.id}`)}>
                  <TableCell className="font-medium">{case_.title}</TableCell>
                  <TableCell>
                    <div>
                      <div>{case_.clientName}</div>
                      <div className="text-sm text-gray-500">{case_.clientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{case_.assignedOffice?.name}</div>
                      <div className="text-sm text-gray-500">{case_.assignedOffice?.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(case_.status)}>
                      {case_.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadgeColor(case_.priority)}>
                      {case_.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{case_.category}</TableCell>
                  <TableCell>{format(new Date(case_.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/coordinator/cases/${case_.id}/edit`);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {cases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No cases found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 
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
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AuditRecord } from "@/app/lawyer/compliance/audit/interfaces";
import { mockAudits } from "@/app/lawyer/compliance/audit/mockData";

interface AuditListProps {
  searchQuery: string;
  filters: {
    type?: string[];
    status?: string[];
    priority?: string[];
    category?: string[];
  };
}

const statusIcons = {
  PENDING: Clock,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle,
  OVERDUE: AlertTriangle,
  REQUIRES_REVIEW: Eye,
  NON_COMPLIANT: AlertTriangle
};

const statusColors = {
  PENDING: "bg-yellow-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
  OVERDUE: "bg-red-500",
  REQUIRES_REVIEW: "bg-purple-500",
  NON_COMPLIANT: "bg-red-500"
};

export function AuditList({ searchQuery, filters }: AuditListProps) {
  // Mock data - replace with API call
  const audits: AuditRecord[] = mockAudits;

  return (
    <div className="space-y-4">
      {audits.map((audit) => (
        <Card key={audit.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {audit.type} Audit
                  <Badge 
                    variant="secondary"
                    className={cn("text-white", statusColors[audit.status])}
                  >
                    {audit.status}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {audit.description}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Due Date</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(audit.dueDate), "MMM d, yyyy")}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Assigned To</div>
                <div className="text-sm text-muted-foreground">
                  {audit.assignedTo.name}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Documents</div>
                <div className="text-sm text-muted-foreground">
                  {audit.documents.length} files
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 
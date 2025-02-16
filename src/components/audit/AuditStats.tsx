"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { mockAudits } from "@/app/lawyer/compliance/audit/mockData";

const stats = [
  {
    title: "Total Audits",
    value: mockAudits.length.toString(),
    description: "Active audits",
    icon: FileText,
    color: "text-blue-500",
  },
  {
    title: "In Progress",
    value: mockAudits.filter(a => a.status === 'IN_PROGRESS').length.toString(),
    description: "Currently ongoing",
    icon: Clock,
    color: "text-yellow-500",
  },
  {
    title: "Completed",
    value: mockAudits.filter(a => a.status === 'COMPLETED').length.toString(),
    description: "This month",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    title: "Requires Attention",
    value: mockAudits.filter(a => 
      a.status === 'OVERDUE' || 
      a.status === 'REQUIRES_REVIEW' ||
      a.priority === 'CRITICAL'
    ).length.toString(),
    description: "Critical or overdue",
    icon: AlertTriangle,
    color: "text-red-500",
  },
];

export function AuditStats() {
  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
} 
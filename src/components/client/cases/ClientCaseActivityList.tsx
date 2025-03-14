"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  lawyer: {
    name: string;
  };
}

export function ClientCaseActivityList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      const response = await fetch("/api/client/cases/activities");
      if (!response.ok) throw new Error("Failed to fetch activities");
      
      const data = await response.json();
      setActivities(data.activities);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "COURT_HEARING":
        return "bg-red-100 text-red-800";
      case "DOCUMENT_FILING":
        return "bg-blue-100 text-blue-800";
      case "CLIENT_MEETING":
        return "bg-green-100 text-green-800";
      case "EVIDENCE_COLLECTION":
        return "bg-purple-100 text-purple-800";
      case "LEGAL_RESEARCH":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "DELAYED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatActivityType = (type: string) => {
    if (!type) return "Unknown";
    return type.replace(/_/g, " ");
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    return status.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lawyer</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(activity.type)}>
                    {formatActivityType(activity.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(activity.status)}>
                    {formatStatus(activity.status)}
                  </Badge>
                </TableCell>
                <TableCell>{activity.lawyer.name}</TableCell>
                <TableCell>
                  {format(new Date(activity.createdAt), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {activities.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No activities found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Activities will appear here once your lawyer updates your case
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
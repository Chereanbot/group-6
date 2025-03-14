"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, FileText, Scale, UserCheck, Star } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface CaseOverview {
  caseDetails: {
    title: string;
    status: string;
    category: string;
    priority: string;
    createdAt: string;
    progress: number;
    lawyer: {
      name: string;
      rating: number;
    };
  };
  metrics: {
    totalActivities: number;
    completedActivities: number;
    documentsSubmitted: number;
    daysActive: number;
  };
}

export function ClientCaseOverview() {
  const [data, setData] = useState<CaseOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCaseOverview();
  }, []);

  async function fetchCaseOverview() {
    try {
      const response = await fetch("/api/client/cases/overview");
      if (!response.ok) throw new Error("Failed to fetch case overview");
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load case overview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <OverviewSkeleton />;
  if (!data) return null;

  const { caseDetails, metrics } = data;
  const activityProgress = (metrics.completedActivities / metrics.totalActivities) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Case Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Case Status</p>
                <h3 className="text-2xl font-bold">{caseDetails.status}</h3>
              </div>
              <div className={`p-2 rounded-full ${
                caseDetails.status === 'ACTIVE' ? 'bg-green-100' :
                caseDetails.status === 'PENDING' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <Progress value={caseDetails.progress} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              {caseDetails.progress}% Complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Activities</p>
                <h3 className="text-2xl font-bold">{metrics.completedActivities}/{metrics.totalActivities}</h3>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <Progress value={activityProgress} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              {activityProgress.toFixed(1)}% Activities Completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Documents</p>
                <h3 className="text-2xl font-bold">{metrics.documentsSubmitted}</h3>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Documents Submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Case Duration</p>
                <h3 className="text-2xl font-bold">{metrics.daysActive} days</h3>
              </div>
              <div className="p-2 rounded-full bg-orange-100">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Active since {format(new Date(caseDetails.createdAt), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Lawyer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-green-100">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Assigned Lawyer</p>
              <h3 className="text-lg font-semibold">{caseDetails.lawyer.name}</h3>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < caseDetails.lawyer.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {caseDetails.lawyer.rating.toFixed(1)} Rating
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-2 w-full mt-4" />
              <Skeleton className="h-4 w-[100px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-[150px] mb-2" />
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[100px] mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
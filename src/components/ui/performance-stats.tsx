import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown, Users, Briefcase, Scale, Clock } from "lucide-react";

interface PerformanceStatProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  description: string;
}

interface PerformanceData {
  totalCases: number;
  totalCasesChange: number;
  clientSatisfaction: number;
  clientSatisfactionChange: number;
  resolutionRate: number;
  resolutionRateChange: number;
  responseTime: number;
  responseTimeChange: number;
}

export function PerformanceStat({ title, value, change, icon, description }: PerformanceStatProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs">
          {change >= 0 ? (
            <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
          )}
          <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
            {Math.abs(change)}% from last period
          </span>
        </div>
        <Progress value={Math.abs(change)} className="mt-2" />
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}

export function PerformanceStatsGrid({ data }: { data: PerformanceData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <PerformanceStat
        title="Total Cases"
        value={data.totalCases}
        change={data.totalCasesChange}
        icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        description="Active legal cases across all offices"
      />
      <PerformanceStat
        title="Client Satisfaction"
        value={data.clientSatisfaction}
        change={data.clientSatisfactionChange}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Average client satisfaction score"
      />
      <PerformanceStat
        title="Case Resolution Rate"
        value={data.resolutionRate}
        change={data.resolutionRateChange}
        icon={<Scale className="h-4 w-4 text-muted-foreground" />}
        description="Percentage of cases resolved successfully"
      />
      <PerformanceStat
        title="Average Response Time"
        value={data.responseTime}
        change={data.responseTimeChange}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        description="Hours to initial client response"
      />
    </div>
  );
} 
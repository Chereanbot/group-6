import ActivityDashboard from "@/components/lawyer/reports/ActivityDashboard";

export default function CaseActivityPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Case Activity Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track and analyze case activities, traffic patterns, and engagement metrics
        </p>
      </div>
      <ActivityDashboard />
    </div>
  );
} 
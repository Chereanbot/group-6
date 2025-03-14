import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Briefcase, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import Link from 'next/link';

export default function CasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 p-6">
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Case Management</h1>
            <p className="text-muted-foreground">Manage and track all your legal cases</p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/lawyer/cases/new"
              className="btn btn-primary inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Briefcase className="w-4 h-4" />
              New Case
            </Link>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 gap-4 bg-muted p-1">
          <TabsTrigger asChild value="all">
            <Link href="/lawyer/cases" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              All Cases
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="active">
            <Link href="/lawyer/cases/active" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Active Cases
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="pending">
            <Link href="/lawyer/cases/pending" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Pending Cases
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="completed">
            <Link href="/lawyer/cases/completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed Cases
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="activities">
            <Link href="/lawyer/cases/activities" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
} 
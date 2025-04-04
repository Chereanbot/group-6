'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-utils';
import { format } from 'date-fns';
import { HistoryFilters } from './components/HistoryFilters';
import { HistoryEntryCard } from './components/HistoryEntryCard';
import { HistorySkeleton } from './components/HistorySkeleton';
import { HistoryPagination } from './components/HistoryPagination';
import { HistoryNotFound } from './components/HistoryNotFound';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { HistoryFilters as HistoryFiltersType } from './types';

interface HistoryEntry {
  id: string;
  action: string;
  actionLabel?: string;
  changeDetails?: string;
  changedAt: string;
  formattedDate?: string;
  client?: { id: string; fullName: string; email: string; status?: string; };
  case?: { id: string; title: string; status: string; };
  lawyer?: { id: string; fullName: string; email: string; };
  office?: { id: string; name: string; };
  document?: { id: string; title: string; type: string; };
  appointment?: { id: string; startTime: string; };
  serviceRequest?: { id: string; title: string; status: string; };
  previousValue?: any;
  newValue?: any;
  context?: any;
  metadata?: any;
}

interface AuthInfo {
  isAuthenticated: boolean;
  userRole?: string;
  error?: string;
  history?: HistoryEntry[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function RecentHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    isAuthenticated: false
  });
  const [filters, setFilters] = useState<HistoryFiltersType>({
    search: '',
    action: undefined,
    startDate: undefined,
    endDate: undefined,
    entityType: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pagination.limit.toString(),
          ...(filters.search && { search: filters.search }),
          ...(filters.action && { action: filters.action }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(filters.entityType !== 'all' && { entityType: filters.entityType }),
          ...(filters.status !== 'all' && { status: filters.status })
        });

        const response = await fetchWithAuth(`/api/coordinator/history/recent?${params}`);
        const data = await response.json();

        if (!data.success) {
          setAuthInfo({
            isAuthenticated: false,
            error: data.message || 'Failed to load history'
          });
          return;
        }

        // Format dates and add labels
        const formattedHistory = data.data.history.map((entry: HistoryEntry) => ({
          ...entry,
          formattedDate: format(new Date(entry.changedAt), 'PPpp'),
          actionLabel: formatActionLabel(entry.action)
        }));

        setAuthInfo({
          isAuthenticated: true,
          userRole: data.data.coordinator.type,
          history: formattedHistory
        });
        setFilteredHistory(formattedHistory);
        setPagination(data.data.pagination);

      } catch (err) {
        console.error('Failed to load history:', err);
        setAuthInfo({
          isAuthenticated: false,
          error: err instanceof Error ? err.message : 'Failed to load history'
        });
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [currentPage, filters]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.entityType !== 'all' && { entityType: filters.entityType }),
        ...(filters.status !== 'all' && { status: filters.status })
      });

      const response = await fetchWithAuth(`/api/coordinator/history/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coordinator-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export history:', error);
    }
  };

  const formatActionLabel = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleReset = () => {
    setFilters({
      search: '',
      action: undefined,
      startDate: undefined,
      endDate: undefined,
      entityType: 'all',
      status: 'all'
    });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <CardHeader>
          <CardTitle>Coordinator History</CardTitle>
          <CardDescription>Loading your recent activities...</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <HistorySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Track all your actions and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Recent History</h1>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <HistoryFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleReset}
            onExport={handleExport}
          />
        </CardContent>
      </Card>

      {authInfo.error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{authInfo.error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => (
            <Link key={entry.id} href={`/coordinator/recent-history/${entry.id}`}>
              <HistoryEntryCard entry={entry} />
            </Link>
          ))}
          {filteredHistory.length === 0 && (
            <HistoryNotFound 
              message={filters.search 
                ? `No results found for "${filters.search}"`
                : 'No history entries found matching your filters.'} 
            />
          )}
          {pagination.totalPages > 1 && (
            <HistoryPagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
} 
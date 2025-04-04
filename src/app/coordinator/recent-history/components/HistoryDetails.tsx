import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { HistoryEntry } from '@/app/coordinator/recent-history/types';

export function HistoryDetails() {
  const { id } = useParams();
  const [history, setHistory] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoryDetails = async () => {
      try {
        const response = await fetch(`/api/coordinator/history/${id}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        setHistory(data.data.history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistoryDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!history) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>No history details found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>History Details</CardTitle>
          <Badge variant="outline">{history.action}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Change Details</h3>
            <p className="text-sm text-gray-600">{history.changeDetails}</p>
          </div>

          <div>
            <h3 className="font-medium">Previous Value</h3>
            <pre className="mt-1 rounded bg-gray-50 p-2 text-sm">
              {JSON.stringify(history.previousValue, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-medium">New Value</h3>
            <pre className="mt-1 rounded bg-gray-50 p-2 text-sm">
              {JSON.stringify(history.newValue, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-medium">Context</h3>
            <pre className="mt-1 rounded bg-gray-50 p-2 text-sm">
              {JSON.stringify(history.context, null, 2)}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Changed At</h3>
              <p className="text-sm text-gray-600">
                {format(new Date(history.changedAt), 'PPpp')}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Changed By</h3>
              <p className="text-sm text-gray-600">{history.changedBy}</p>
            </div>
          </div>

          {history.client && (
            <div>
              <h3 className="font-medium">Related Client</h3>
              <div className="mt-1 rounded bg-gray-50 p-2">
                <p className="text-sm">{history.client.fullName}</p>
              </div>
            </div>
          )}

          {history.case && (
            <div>
              <h3 className="font-medium">Related Case</h3>
              <div className="mt-1 rounded bg-gray-50 p-2">
                <p className="text-sm">{history.case.title}</p>
              </div>
            </div>
          )}

          {history.document && (
            <div>
              <h3 className="font-medium">Related Document</h3>
              <div className="mt-1 rounded bg-gray-50 p-2">
                <p className="text-sm">{history.document.title}</p>
              </div>
            </div>
          )}

          {history.appointment && (
            <div>
              <h3 className="font-medium">Related Appointment</h3>
              <div className="mt-1 rounded bg-gray-50 p-2">
                <p className="text-sm">
                  {format(new Date(history.appointment.startTime), 'PPpp')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
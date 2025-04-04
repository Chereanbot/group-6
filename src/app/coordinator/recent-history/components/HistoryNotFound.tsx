import { SearchX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HistoryNotFoundProps {
  message?: string;
}

export function HistoryNotFound({ message = 'No history entries found matching your filters.' }: HistoryNotFoundProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </CardContent>
    </Card>
  );
} 
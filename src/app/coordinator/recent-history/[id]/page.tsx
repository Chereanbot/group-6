import { HistoryDetails } from '../components/HistoryDetails';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function HistoryEntryPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/coordinator/recent-history">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </Link>
      </div>

      <HistoryDetails />
    </div>
  );
} 
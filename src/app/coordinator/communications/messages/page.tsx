import MessagesPage from '@/components/coordinator/communications/MessagesPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | Coordinator Communications',
  description: 'Communicate with admins, lawyers, and clients through our messaging system',
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <MessagesPage />
    </div>
  );
} 
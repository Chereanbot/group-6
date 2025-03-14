import { Metadata } from 'next';
import SmsPage from '@/components/coordinator/communications/SmsPage';

export const metadata: Metadata = {
  title: 'SMS Communications | Coordinator Dashboard',
  description: 'Send and manage SMS communications with clients, lawyers, and team members',
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SmsPage />
    </div>
  );
} 
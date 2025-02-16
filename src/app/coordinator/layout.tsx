import { Metadata } from 'next';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Coordinator Dashboard | DulaCMS',
  description: 'Legal aid coordinator dashboard for case management',
};

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ClientLayout>{children}</ClientLayout>
    </div>
  );
} 
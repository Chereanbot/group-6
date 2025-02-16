import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export const metadata: Metadata = {
  title: 'Client Dashboard',
  description: 'Client dashboard and management',
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="p-4">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
} 
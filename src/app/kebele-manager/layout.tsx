"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageProvider } from './contexts/MessageContext';
import KebeleManagerSidebar from './components/Sidebar';
import KebeleManagerHeader from './components/Header';

export default function KebeleManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if user is authenticated
    const managerId = localStorage.getItem('managerId');
    const kebeleId = localStorage.getItem('kebeleId');

    if (!managerId || !kebeleId) {
      // Redirect to login if not authenticated
      router.push('/kebele-manager/login');
    }
  }, [router]);

  // Don't render anything on the server
  if (!isClient) {
    return null;
  }

  // Don't show layout on login page
  if (pathname === '/kebele-manager/login') {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <MessageProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <KebeleManagerHeader onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex">
          <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
            <KebeleManagerSidebar isOpen={isSidebarOpen} />
          </div>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </MessageProvider>
  );
} 
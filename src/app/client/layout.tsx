"use client";

import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import UpgradePromotion from '@/components/premium/UpgradePromotion';
import PremiumBanner from '@/components/premium/PremiumBanner';
import { usePageMatch } from '@/hooks/usePageMatch';
import { getServiceType } from '@/utils/userSession';

// Metadata is moved to a separate file for client components

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [serviceType, setServiceType] = useState<string | null>(null);
  
  // Pages where we want to show the compact premium banner
  const showBannerPages = [
    '/client/cases/my-cases',
    '/client/cases/case-activity',
    '/client/appointments/list',
    '/client/appointments/calendar'
  ];
  
  // Check if current page should show the banner
  const shouldShowBanner = usePageMatch(showBannerPages);
  
  useEffect(() => {
    // Get user's service type
    const userServiceType = getServiceType();
    setServiceType(userServiceType);
  }, []);
  
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="p-4">
            {/* Show premium banner on specific pages for free tier users */}
            {shouldShowBanner && serviceType === 'aid' && (
              <PremiumBanner compact={true} className="mb-4" />
            )}
            
            {children}
            
            {/* Show full premium banner on specific pages at the bottom */}
            {pathname === '/client/dashboard' && serviceType === 'aid' && (
              <div className="mt-8">
                <PremiumBanner />
              </div>
            )}
          </main>
        </div>
        
        {/* Premium upgrade promotion that appears on all client pages for free tier users */}
        {serviceType === 'aid' && <UpgradePromotion />}
        
        {/* Floating premium badge for free tier users */}
        {serviceType === 'aid' && (
          <div className="fixed top-20 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-l-md shadow-md z-30 transform hover:translate-x-0 translate-x-1/2 hover:translate-x-0 transition-transform duration-300 cursor-pointer">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold">GO PREMIUM</span>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
} 
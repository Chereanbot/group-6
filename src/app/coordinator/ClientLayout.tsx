"use client";

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/coordinator/Sidebar';
import Header from '@/components/coordinator/Header';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
} 
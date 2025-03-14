import { Metadata } from 'next';
import Link from 'next/link';
import { HiOutlineChatAlt2, HiOutlinePhone } from 'react-icons/hi';

export const metadata: Metadata = {
  title: 'Communications | Coordinator',
  description: 'Manage all your communications in one place',
};

export default function CommunicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link 
                href="/coordinator/communications/messages"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                <HiOutlineChatAlt2 className="w-5 h-5 mr-2" />
                Messages
              </Link>
              <Link 
                href="/coordinator/communications/phone-log"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                <HiOutlinePhone className="w-5 h-5 mr-2" />
                Phone Log
              </Link>
            </div>
          </div>
        </nav>
      </div>
      {children}
    </div>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineBadgeCheck,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';

interface Coordinator {
  id: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
}

interface Office {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  capacity: number;
  currentCount: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  available: boolean;
  isCurrentOffice: boolean;
  coordinators: Coordinator[];
}

export default function CoordinatorOfficesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [currentOfficeId, setCurrentOfficeId] = useState<string>('');

  useEffect(() => {
    if (session) {
      loadOffices();
    }
  }, [session]);

  const loadOffices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/coordinator/offices', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch offices');
      }
      
      const result = await response.json();

      if (result.success) {
        setOffices(result.data.offices);
        setCurrentOfficeId(result.data.currentOfficeId);
      } else {
        throw new Error(result.error || 'Failed to load offices');
      }
    } catch (error) {
      console.error('Error loading offices:', error);
      setError(error instanceof Error ? error.message : 'Failed to load offices');
      toast.error('Failed to load offices');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  // Show loading state while fetching offices
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading offices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <HiOutlineExclamationCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Offices</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => loadOffices()}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (offices.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Offices Found</h2>
        <p className="text-gray-600 dark:text-gray-400">
          There are currently no active offices available.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Legal Aid Offices</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offices.map((office) => (
          <div
            key={office.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow
              ${office.isCurrentOffice ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <HiOutlineOfficeBuilding className="w-6 h-6 text-primary-500 mr-2" />
                <div>
                  <h2 className="text-lg font-semibold">{office.name.replace('_', ' ')}</h2>
                  {office.isCurrentOffice && (
                    <span className="flex items-center text-sm text-primary-500">
                      <HiOutlineBadgeCheck className="w-4 h-4 mr-1" />
                      Your Office
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  office.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {office.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <HiOutlineLocationMarker className="w-5 h-5 mr-2" />
                <span>{office.location}</span>
              </div>

              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <HiOutlineUsers className="w-5 h-5 mr-2" />
                <span>
                  {office.currentCount} / {office.capacity} Coordinators
                </span>
              </div>

              {office.contactEmail && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <HiOutlineMail className="w-5 h-5 mr-2" />
                  <a
                    href={`mailto:${office.contactEmail}`}
                    className="hover:text-primary-500"
                  >
                    {office.contactEmail}
                  </a>
                </div>
              )}

              {office.contactPhone && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <HiOutlinePhone className="w-5 h-5 mr-2" />
                  <a
                    href={`tel:${office.contactPhone}`}
                    className="hover:text-primary-500"
                  >
                    {office.contactPhone}
                  </a>
                </div>
              )}
            </div>

            {office.address && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {office.address}
                </p>
              </div>
            )}

            {office.coordinators.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium mb-2">Coordinators</h3>
                <div className="space-y-2">
                  {office.coordinators.map((coordinator) => (
                    <div 
                      key={coordinator.id}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div className="font-medium">{coordinator.user.fullName}</div>
                      <div className="text-xs">
                        <a 
                          href={`mailto:${coordinator.user.email}`}
                          className="hover:text-primary-500"
                        >
                          {coordinator.user.email}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
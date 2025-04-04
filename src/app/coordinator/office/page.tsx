"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Users, Briefcase, Archive, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Office {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  capacity: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  statistics: {
    totalCases: number;
    activeCases: number;
    totalLawyers: number;
    totalClients: number;
    totalResources: number;
  };
  coordinators: Array<{
    id: string;
    type: string;
    user: {
      fullName: string;
      email: string;
      phone: string;
    };
  }>;
  lawyers: Array<{
    id: string;
    user: {
      fullName: string;
      email: string;
      phone: string;
    };
  }>;
}

interface Coordinator {
  id: string;
  type: string;
  specialties: string[];
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export default function CoordinatorOfficePage() {
  const [office, setOffice] = useState<Office | null>(null);
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOfficeDetails();
  }, []);

  const fetchOfficeDetails = async () => {
    try {
      const response = await fetch('/api/coordinator/office', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!data.success) {
        if (data.message === 'Authentication required' || data.message === 'Invalid or expired token') {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch office details');
      }

      setOffice(data.office);
      setCoordinator(data.coordinator);
    } catch (error) {
      console.error('Error fetching office details:', error);
      toast.error('An error occurred while fetching office details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <OfficeDetailsSkeleton />;
  }

  if (!office || !coordinator) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            No office details available. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        {/* Office Overview */}
        <Card>
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{office.name}</CardTitle>
              <Badge variant={office.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {office.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 p-6">
            {/* Contact Information */}
            <div className="grid gap-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{office.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{office.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{office.contactPhone}</span>
                </div>
              </div>
            </div>

            {/* Office Statistics */}
            <div className="grid gap-4">
              <h3 className="font-semibold">Office Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Active Cases"
                  value={office.statistics.activeCases}
                  total={office.statistics.totalCases}
                />
                <StatCard
                  icon={<Users className="h-4 w-4" />}
                  label="Lawyers"
                  value={office.statistics.totalLawyers}
                />
                <StatCard
                  icon={<Users className="h-4 w-4" />}
                  label="Coordinators"
                  value={office.coordinators.length}
                />
                <StatCard
                  icon={<Users className="h-4 w-4" />}
                  label="Clients"
                  value={office.statistics.totalClients}
                />
                <StatCard
                  icon={<Archive className="h-4 w-4" />}
                  label="Resources"
                  value={office.statistics.totalResources}
                />
              </div>
            </div>

            {/* Coordinator Information */}
            <div className="grid gap-4">
              <h3 className="font-semibold">Your Profile</h3>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Name:</span>
                  <span>{coordinator.user.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Type:</span>
                  <span>{coordinator.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Specialties:</span>
                  <div className="flex flex-wrap gap-1">
                    {coordinator.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, total }: { icon: React.ReactNode; label: string; value: number; total?: number }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-lg bg-secondary/10">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-lg font-semibold">
        {value}{total ? `/${total}` : ''}
      </div>
    </div>
  );
}

function OfficeDetailsSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Pencil } from 'lucide-react';
import { translate } from '@/utils/translations';
import type { ClientProfile } from '@/types/client';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function ClientProfilePage(): JSX.Element {
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAmharic, setIsAmharic] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/client/profile');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setProfile(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      toast({
        title: translate('Error', isAmharic),
        description: translate('Failed to fetch profile', isAmharic),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">{translate(error, isAmharic)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 space-y-6"
    >
      {/* Language Switch and Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.push('/client/profile/edit')}
        >
          <Pencil className="w-4 h-4" />
          {translate('Edit Profile', isAmharic)}
        </Button>
        <div className="flex items-center space-x-2">
          <Label htmlFor="language-switch">
            {isAmharic ? 'አማርኛ' : 'English'}
          </Label>
          <Switch
            id="language-switch"
            checked={isAmharic}
            onCheckedChange={setIsAmharic}
          />
        </div>
      </div>

      {/* Profile Header */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center space-x-4 p-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.user?.fullName}`} />
            <AvatarFallback>{profile?.user?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile?.user?.fullName}</h1>
            <p className="text-muted-foreground">{profile?.user?.email}</p>
            <Badge variant="outline" className="mt-2">
              {translate(profile?.user?.status || '', isAmharic)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {translate('Personal Information', isAmharic)}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{translate('Age', isAmharic)}</Label>
                <p className="text-lg">{profile?.age}</p>
              </div>
              <div>
                <Label>{translate('Gender', isAmharic)}</Label>
                <p className="text-lg">{translate(profile?.sex || '', isAmharic)}</p>
              </div>
              <div>
                <Label>{translate('Phone', isAmharic)}</Label>
                <p className="text-lg">{profile?.phone}</p>
              </div>
              <div>
                <Label>{translate('Number of Family', isAmharic)}</Label>
                <p className="text-lg">{profile?.numberOfFamily}</p>
              </div>
              <div className="col-span-2">
                <Label>{translate('Health Status', isAmharic)}</Label>
                <p className="text-lg">{translate(profile?.healthStatus || '', isAmharic)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {translate('Location Information', isAmharic)}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{translate('Region', isAmharic)}</Label>
                <p className="text-lg">{profile?.region}</p>
              </div>
              <div>
                <Label>{translate('Zone', isAmharic)}</Label>
                <p className="text-lg">{profile?.zone}</p>
              </div>
              <div>
                <Label>{translate('Wereda', isAmharic)}</Label>
                <p className="text-lg">{profile?.wereda}</p>
              </div>
              <div>
                <Label>{translate('Kebele', isAmharic)}</Label>
                <p className="text-lg">{profile?.kebele}</p>
              </div>
              {profile?.houseNumber && (
                <div>
                  <Label>{translate('House Number', isAmharic)}</Label>
                  <p className="text-lg">{profile.houseNumber}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Office Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {translate('Office Information', isAmharic)}
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Office Details */}
              <div className="space-y-4">
                <h3 className="font-medium">{translate('Office Details', isAmharic)}</h3>
                <div className="space-y-2">
                  <Label>{translate('Name', isAmharic)}</Label>
                  <p className="text-lg">{profile?.assignedOffice?.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>{translate('Location', isAmharic)}</Label>
                  <p className="text-lg">{profile?.assignedOffice?.location}</p>
                </div>
                <div className="space-y-2">
                  <Label>{translate('Contact', isAmharic)}</Label>
                  <p className="text-lg">{profile?.assignedOffice?.phone}</p>
                </div>
              </div>

              {/* Assigned Staff */}
              <div className="space-y-4">
                <h3 className="font-medium">{translate('Assigned Staff', isAmharic)}</h3>
                
                {/* Coordinators */}
                <div className="space-y-2">
                  <Label>{translate('Coordinators', isAmharic)}</Label>
                  <div className="space-y-2">
                    {profile?.assignedOffice?.coordinators.map((coordinator) => (
                      <div key={coordinator.id} className="p-2 rounded-md border">
                        <p className="font-medium">{coordinator.user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{coordinator.user.email}</p>
                        <p className="text-sm text-muted-foreground">{coordinator.user.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lawyers */}
                <div className="space-y-2">
                  <Label>{translate('Lawyers', isAmharic)}</Label>
                  <div className="space-y-2">
                    {profile?.assignedOffice?.lawyers.map((lawyer) => (
                      <div key={lawyer.id} className="p-2 rounded-md border">
                        <p className="font-medium">{lawyer.user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{lawyer.user.email}</p>
                        <p className="text-sm text-muted-foreground">{lawyer.user.phone}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {lawyer.specializations.map((spec) => (
                            <Badge key={spec.id} variant="secondary" className="text-xs">
                              {translate(spec.specialization.name, isAmharic)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {translate('Cases Information', isAmharic)}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile?.assignedOffice?.cases?.map((case_) => (
                <div key={case_.id} className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{case_.title}</h3>
                    <Badge variant="outline" className={cn(
                      case_.status === 'ACTIVE' && 'bg-green-100 text-green-800',
                      case_.status === 'PENDING' && 'bg-yellow-100 text-yellow-800',
                      case_.status === 'CLOSED' && 'bg-gray-100 text-gray-800'
                    )}>
                      {translate(case_.status, isAmharic)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>{translate('Category', isAmharic)}</Label>
                      <p>{translate(case_.category, isAmharic)}</p>
                    </div>
                    <div>
                      <Label>{translate('Priority', isAmharic)}</Label>
                      <Badge variant="outline" className={cn(
                        case_.priority === 'HIGH' && 'bg-red-100 text-red-800',
                        case_.priority === 'MEDIUM' && 'bg-yellow-100 text-yellow-800',
                        case_.priority === 'LOW' && 'bg-green-100 text-green-800'
                      )}>
                        {translate(case_.priority, isAmharic)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{translate('Created', isAmharic)}: {format(new Date(case_.createdAt), 'PPP')}</span>
                    <span>{translate('Updated', isAmharic)}: {format(new Date(case_.updatedAt), 'PPP')}</span>
                  </div>
                </div>
              ))}
              
              {(!profile?.assignedOffice?.cases || profile.assignedOffice.cases.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  {translate('No cases found', isAmharic)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
} 
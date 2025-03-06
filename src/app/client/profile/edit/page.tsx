'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { translate } from '@/utils/translations';
import type { ClientProfile } from '@/types/client';
import { HealthStatus } from '@prisma/client';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { ArrowLeft } from 'lucide-react';

export default function EditProfilePage(): JSX.Element {
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/client/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: profile?.phone ?? '',
          healthStatus: profile?.healthStatus ?? HealthStatus.HEALTHY,
          houseNumber: profile?.houseNumber ?? '',
          notes: profile?.notes ?? '',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      toast({
        title: translate('Success', isAmharic),
        description: translate('Profile updated successfully', isAmharic),
      });

      router.push('/client/profile');
    } catch (err) {
      toast({
        title: translate('Error', isAmharic),
        description: translate('Failed to update profile', isAmharic),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
      {/* Language Switch and Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.push('/client/profile')}
        >
          <ArrowLeft className="w-4 h-4" />
          {translate('Back', isAmharic)}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {translate('Personal Information', isAmharic)}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{translate('Phone', isAmharic)}</Label>
                <Input
                  id="phone"
                  value={profile?.phone ?? ''}
                  onChange={(e) => setProfile(prev => 
                    prev ? { ...prev, phone: e.target.value } : null
                  )}
                  placeholder={translate('Enter phone number', isAmharic)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="healthStatus">{translate('Health Status', isAmharic)}</Label>
                <Select
                  value={profile?.healthStatus ?? HealthStatus.HEALTHY}
                  onValueChange={(value: HealthStatus) => 
                    setProfile(prev => prev ? { ...prev, healthStatus: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={translate('Select health status', isAmharic)} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(HealthStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {translate(status, isAmharic)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className="space-y-2">
              <Label htmlFor="houseNumber">{translate('House Number', isAmharic)}</Label>
              <Input
                id="houseNumber"
                value={profile?.houseNumber ?? ''}
                onChange={(e) => 
                  setProfile(prev => prev ? { ...prev, houseNumber: e.target.value } : null)
                }
                placeholder={translate('Enter house number', isAmharic)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {translate('Additional Information', isAmharic)}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">{translate('Notes', isAmharic)}</Label>
              <Textarea
                id="notes"
                value={profile?.notes ?? ''}
                onChange={(e) => 
                  setProfile(prev => prev ? { ...prev, notes: e.target.value } : null)
                }
                placeholder={translate('Enter additional notes', isAmharic)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/client/profile')}
          >
            {translate('Cancel', isAmharic)}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? translate('Saving...', isAmharic) : translate('Save Changes', isAmharic)}
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 
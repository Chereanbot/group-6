"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { CoordinatorStatus, CoordinatorType, OfficeType } from '@prisma/client';
import { Edit, Mail, Phone, MapPin, Building, Calendar, Users, Briefcase, FileText } from 'lucide-react';

interface CoordinatorProfile {
  id: string;
  type: CoordinatorType;
  specialties: string[];
  startDate: Date;
  endDate?: Date;
  status: CoordinatorStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  office: {
    id: string;
    name: string;
    location: string;
    type: OfficeType;
    status: string;
    contactEmail: string;
    contactPhone: string;
    capacity: number;
    totalCoordinators: number;
    coordinators: Array<{
      id: string;
      fullName: string;
      email: string;
    }>;
  };
  stats: {
    activeCases: number;
    totalClients: number;
    pendingAppointments: number;
  };
  recentCases: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    clientName: string;
    createdAt: Date;
  }>;
}

export default function CoordinatorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoordinatorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    phone: '',
    specialties: [] as string[]
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/coordinator/profiles', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to fetch profile');
        return;
      }

      setProfile(data.data);
      setEditData({
        fullName: data.data.user.fullName,
        phone: data.data.user.phone || '',
        specialties: data.data.specialties
      });
    } catch (error) {
      setError('An error occurred while fetching profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/coordinator/profiles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editData)
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to update profile');
        return;
      }

      setEditMode(false);
      fetchProfile();
    } catch (error) {
      setError('An error occurred while updating profile');
      console.error('Error updating profile:', error);
    }
  };

  const getStatusColor = (status: CoordinatorStatus) => {
    switch (status) {
      case CoordinatorStatus.ACTIVE:
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
      case CoordinatorStatus.PENDING:
        return 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800';
      case CoordinatorStatus.INACTIVE:
        return 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
      case CoordinatorStatus.SUSPENDED:
        return 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No profile found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen transition-colors duration-300">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your profile and view your information
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 
                hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all duration-300 animate-fade-in"
            >
              <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-indigo-600 dark:text-indigo-400">Edit Profile</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-indigo-200 dark:border-indigo-800 dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-indigo-600 dark:text-indigo-400">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <Input
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-700 
                    focus:ring-indigo-200 dark:focus:ring-indigo-800 dark:bg-slate-800 transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-700 
                    focus:ring-indigo-200 dark:focus:ring-indigo-800 dark:bg-slate-800 transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialties</label>
                <Input
                  value={editData.specialties.join(', ')}
                  onChange={(e) => setEditData({ ...editData, specialties: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="Enter specialties separated by commas"
                  className="border-indigo-200 dark:border-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-700 
                    focus:ring-indigo-200 dark:focus:ring-indigo-800 dark:bg-slate-800 transition-colors duration-200"
                />
              </div>
              <Button 
                onClick={handleUpdateProfile} 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 
                  dark:from-indigo-500 dark:to-violet-500 dark:hover:from-indigo-600 dark:hover:to-violet-600 
                  transition-all duration-300"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Profile Card */}
          <Card className="border-indigo-200 dark:border-indigo-800 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/50 
            dark:bg-slate-900 transition-all duration-300 hover:shadow-xl animate-fade-in">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 
              pb-2 border-b border-indigo-100 dark:border-indigo-800">
              <Avatar className="h-24 w-24 ring-4 ring-indigo-100 dark:ring-indigo-800 transition-transform duration-300 
                hover:scale-105">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.user.fullName}`} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-500 
                  dark:to-violet-500 text-white text-xl">
                  {profile.user.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{profile.user.fullName}</h2>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{profile.user.email}</span>
                </div>
                {profile.user.phone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{profile.user.phone}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" 
                  className={`${getStatusColor(profile.status)} font-medium px-3 py-1 transition-all duration-300 hover:scale-105`}>
                  {profile.status}
                </Badge>
                <Badge variant="outline" 
                  className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 
                    border-indigo-200 dark:border-indigo-800 font-medium px-3 py-1 transition-all duration-300 hover:scale-105">
                  {profile.type}
                </Badge>
                {profile.specialties?.map((specialty, index) => (
                  <Badge key={index} variant="secondary" 
                    className="bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 
                      border-violet-200 dark:border-violet-800 font-medium px-3 py-1 transition-all duration-300 hover:scale-105">
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-50 to-indigo-50 
                  dark:from-slate-900 dark:to-indigo-900/30 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-medium">Started:</span>
                    <span>{formatDate(profile.startDate)}</span>
                  </div>
                  {profile.endDate && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-medium">Ends:</span>
                      <span>{formatDate(profile.endDate)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-50 to-violet-50 
                  dark:from-slate-900 dark:to-violet-900/30 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Briefcase className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    <span className="font-medium">Active Cases:</span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">{profile.stats.activeCases}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    <span className="font-medium">Total Clients:</span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">{profile.stats.totalClients}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    <span className="font-medium">Pending Appointments:</span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">{profile.stats.pendingAppointments}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Cases */}
          <Card className="border-indigo-200 dark:border-indigo-800 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/50 
            dark:bg-slate-900 transition-all duration-300 hover:shadow-xl animate-fade-in">
            <CardHeader className="border-b border-indigo-100 dark:border-indigo-800">
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Recent Cases</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {profile.recentCases.length > 0 ? (
                <div className="space-y-4">
                  {profile.recentCases.map((caseItem) => (
                    <div key={caseItem.id} 
                      className="p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 
                        hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300 
                        bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 
                        hover:shadow-md hover:scale-[1.02]">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{caseItem.title}</h3>
                        <Badge className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 
                          border-indigo-200 dark:border-indigo-800">
                          {caseItem.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between text-sm text-slate-600 dark:text-slate-400 gap-2 sm:gap-0">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Priority:</span>
                          <span className={`${
                            caseItem.priority === 'HIGH' ? 'text-rose-600 dark:text-rose-400' :
                            caseItem.priority === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' :
                            'text-emerald-600 dark:text-emerald-400'
                          }`}>{caseItem.priority}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Client:</span>
                          <span>{caseItem.clientName}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400">No recent cases</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Office Information */}
        <div>
          <Card className="border-indigo-200 dark:border-indigo-800 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/50 
            dark:bg-slate-900 transition-all duration-300 hover:shadow-xl animate-fade-in">
            <CardHeader className="border-b border-indigo-100 dark:border-indigo-800">
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Office Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-50 to-indigo-50 
                dark:from-slate-900 dark:to-indigo-900/30 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium">{profile.office.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>{profile.office.location}</span>
                </div>
                {profile.office.contactPhone && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>{profile.office.contactPhone}</span>
                  </div>
                )}
                {profile.office.contactEmail && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>{profile.office.contactEmail}</span>
                  </div>
                )}
              </div>
              {profile.office.status && (
                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-violet-50 
                  dark:from-slate-900 dark:to-violet-900/30 transition-all duration-300 hover:shadow-md">
                  <Badge variant="outline" 
                    className="bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 
                      border-violet-200 dark:border-violet-800 font-medium px-3 py-1">
                    {profile.office.status}
                  </Badge>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Office Coordinators ({profile.office.totalCoordinators})
                  </span>
                </div>
                <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-50 to-indigo-50 
                  dark:from-slate-900 dark:to-indigo-900/30">
                  {profile.office.coordinators.map((coordinator) => (
                    <div key={coordinator.id} 
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-white/60 dark:hover:bg-white/10 
                        transition-all duration-300 hover:shadow-sm hover:scale-[1.02]">
                      <Avatar className="h-8 w-8 ring-2 ring-indigo-100 dark:ring-indigo-800">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${coordinator.fullName}`} />
                        <AvatarFallback className="bg-indigo-600 dark:bg-indigo-500 text-white">
                          {coordinator.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{coordinator.fullName}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">{coordinator.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
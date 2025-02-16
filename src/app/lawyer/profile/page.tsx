import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { 
  User, Mail, Phone, Building, Award, 
  Star, Briefcase, Scale, Calendar
} from 'lucide-react';
import EditProfileButton from '@/components/lawyer/profile/EditProfileButton';

async function getLawyerProfile(lawyerId: string | null) {
  if (!lawyerId) {
    return null;
  }

  try {
    const profile = await prisma.user.findUnique({
      where: {
        id: lawyerId
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
        lawyerProfile: {
          select: {
            id: true,
            experience: true,
            rating: true,
            caseLoad: true,
            availability: true,
            office: {
              select: {
                name: true,
                location: true,
                contactEmail: true,
                contactPhone: true
              }
            }
          }
        }
      }
    });

    if (!profile || !profile.lawyerProfile) {
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error fetching lawyer profile:', error);
    return null;
  }
}

export default async function LawyerProfile() {
  try {
    const headersList = await headers();
    const lawyerId = headersList.get('x-lawyer-id');

    if (!lawyerId) {
      return (
        <div className="p-6">
          <Card className="p-4">
            <p className="text-red-500">Error: Unable to load profile - Invalid lawyer ID</p>
          </Card>
        </div>
      );
    }

    const profile = await getLawyerProfile(lawyerId);

    if (!profile || !profile.lawyerProfile) {
      return (
        <div className="p-6">
          <Card className="p-4">
            <p className="text-red-500">Error: Profile not found</p>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lawyer Profile</h1>
          <EditProfileButton />
        </div>

        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              {profile.status}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{profile.fullName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{profile.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Professional Details */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Professional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">{profile.lawyerProfile.experience} Years</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Star className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium">
                  {profile.lawyerProfile.rating?.toFixed(1) || 'Not rated'} / 5.0
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Case Load</p>
                <p className="font-medium">{profile.lawyerProfile.caseLoad} cases</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Scale className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className="font-medium">
                  {profile.lawyerProfile.availability ? 'Available' : 'Not Available'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Office Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Office Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Office</p>
                <p className="font-medium">{profile.lawyerProfile.office.name}</p>
                <p className="text-sm text-gray-500">{profile.lawyerProfile.office.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{profile.lawyerProfile.office.contactEmail || 'No email provided'}</p>
                <p className="text-sm text-gray-500">{profile.lawyerProfile.office.contactPhone || 'No phone provided'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error rendering lawyer profile:', error);
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-red-500">Error: Something went wrong while loading the profile</p>
        </Card>
      </div>
    );
  }
} 
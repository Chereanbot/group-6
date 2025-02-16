"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function EditProfileButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push('/lawyer/profile/edit')}
      variant="outline"
      className="flex items-center space-x-2"
    >
      <Edit className="h-4 w-4" />
      <span>Edit Profile</span>
    </Button>
  );
} 
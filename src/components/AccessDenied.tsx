import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function AccessDenied() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h1>
      <p className="text-gray-600 mb-6 text-center">
        This section is restricted to administrators and super administrators only. 
        Please contact your system administrator if you believe you should have access.
      </p>
      <Button
        onClick={() => router.push('/')}
        variant="outline"
      >
        Return to Dashboard
      </Button>
    </div>
  );
} 
import { EmailTest } from '@/components/admin/EmailTest';

export default function TestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">System Tests</h1>
      <div className="grid gap-6">
        <EmailTest />
      </div>
    </div>
  );
} 
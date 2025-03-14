import { cookies } from 'next/headers';
import LawyersPage from './page'; // Adjust the import path as necessary

export default async function LawyersPageWrapper() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  return <LawyersPage token={token} />;
} 
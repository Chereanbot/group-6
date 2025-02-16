import { Metadata } from 'next'
import Login from '@/components/Login'

export const metadata: Metadata = {
  title: 'Login | Authentication',
  description: 'Login to your account',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Login />
    </main>
  )
} 
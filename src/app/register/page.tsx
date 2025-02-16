import { Metadata } from 'next'
import Register from '@/components/Register'

export const metadata: Metadata = {
  title: 'Register | Create Account',
  description: 'Create a new account',
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Register />
    </main>
  )
} 
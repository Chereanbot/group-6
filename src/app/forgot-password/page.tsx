import { Metadata } from 'next'
import ForgotPassword from '@/components/ForgotPassword'

export const metadata: Metadata = {
  title: 'Forgot Password | Reset',
  description: 'Reset your password',
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <ForgotPassword />
    </main>
  )
} 
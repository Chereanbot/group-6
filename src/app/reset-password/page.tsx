import { Metadata } from 'next'
import ResetPassword from '@/components/ResetPassword'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set your new password',
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <ResetPassword />
    </main>
  )
} 
import { Metadata } from 'next'
import OTPVerification from '@/components/OTPVerification'

export const metadata: Metadata = {
  title: 'Verify OTP',
  description: 'Verify your one-time password',
}

export default function VerifyOTPPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <OTPVerification />
    </main>
  )
} 
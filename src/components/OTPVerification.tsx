"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatrixBackground from './MatrixBackground';
import { showToast, hideToast } from '@/utils/toast';

const OTPVerification = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyType, setVerifyType] = useState<string>('');

  useEffect(() => {
    const userId = window.sessionStorage.getItem('userId');
    const type = window.sessionStorage.getItem('verifyType');

    if (!userId || !type) {
      showToast('Please start the verification process again', 'error');
      router.push('/login');
      return;
    }

    setVerifyType(type);

    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, router]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && element.nextElementSibling) {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const inputs = e.currentTarget.parentElement?.getElementsByTagName('input');
      if (inputs && inputs[index - 1]) {
        inputs[index - 1].focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((value, index) => {
      if (index < 6) newOtp[index] = value;
    });
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all digits');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const loadingToast = showToast('Verifying OTP...', 'loading');

      const userId = window.sessionStorage.getItem('userId');
      const type = window.sessionStorage.getItem('verifyType');

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp: otpString,
          type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      hideToast(loadingToast);
      showToast('OTP verified successfully!', 'success');
      
      window.sessionStorage.removeItem('userId');
      window.sessionStorage.removeItem('verifyType');
      
      router.push(type === 'EMAIL' ? '/login' : '/reset-password');

    } catch (error: any) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      const loadingToast = showToast('Sending OTP...', 'loading');

      const userId = window.sessionStorage.getItem('userId');
      const type = window.sessionStorage.getItem('verifyType');
      
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: verifyType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      hideToast(loadingToast);
      showToast('OTP resent successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to resend OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <MatrixBackground />
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form otp-form">
          <h2>Verify OTP</h2>
          <p className="text-secondary">
            Enter the verification code sent to your {verifyType.toLowerCase()}
          </p>

          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="otp-input"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <span className="error-text">{error}</span>}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="resend-otp">
            {timeLeft > 0 ? (
              <p>Resend code in {timeLeft}s</p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="resend-btn"
                disabled={isLoading}
              >
                Resend OTP
              </button>
            )}
          </div>

          <p className="auth-link">
            <Link href="/login">Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification; 
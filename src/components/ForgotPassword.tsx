"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatrixBackground from './MatrixBackground';
import { showToast, hideToast } from '@/utils/toast';
import { showAuthError, showAuthSuccess, showAuthLoading } from '@/utils/auth';

interface ForgotPasswordForm {
  method: 'email' | 'phone';
  identifier: string;
}

const ForgotPassword = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordForm>({
    method: 'email',
    identifier: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateIdentifier = () => {
    if (formData.method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(formData.identifier);
    } else {
      const phoneRegex = /^\+?[1-9]\d{9,11}$/;
      return phoneRegex.test(formData.identifier);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateIdentifier()) {
      setError(`Please enter a valid ${formData.method}`);
      return;
    }

    try {
      setIsLoading(true);
      const loadingToast = showToast('Sending reset link...', 'loading');

      // Simulate API call to send reset link
      await new Promise(resolve => setTimeout(resolve, 1500));

      hideToast(loadingToast);
      showToast('Reset link sent successfully!', 'success');
      
      // Store the recovery method and identifier for the verification step
      sessionStorage.setItem('recoveryMethod', formData.method);
      sessionStorage.setItem('recoveryIdentifier', formData.identifier);
      
      router.push('/verify-otp');

    } catch (error: any) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <MatrixBackground />
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Reset Password</h2>
          <p className="text-secondary">
            Choose how you want to reset your password
          </p>

          <div className="method-selector">
            <button
              type="button"
              className={`method-btn ${formData.method === 'email' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, method: 'email', identifier: '' })}
            >
              <i className="fas fa-envelope"></i>
              Email
            </button>
            <button
              type="button"
              className={`method-btn ${formData.method === 'phone' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, method: 'phone', identifier: '' })}
            >
              <i className="fas fa-phone"></i>
              Phone
            </button>
          </div>

          <div className="form-group">
            <input
              type={formData.method === 'email' ? 'email' : 'tel'}
              className="input-field"
              placeholder={formData.method === 'email' ? 'Enter your email' : 'Enter your phone number'}
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            />
            <div className="input-highlight"></div>
            {error && <span className="error-text">{error}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="auth-link">
            Remember your password? <Link href="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 
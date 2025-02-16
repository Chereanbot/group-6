"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import MatrixBackground from './MatrixBackground';
import { showToast, hideToast } from '@/utils/toast';
import { UserRoleEnum } from '@prisma/client';

interface LoginForm {
  identifier: string;
  password: string;
}

function getRoleBasedRedirect(userRole: string) {
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin/dashboard';
    case 'LAWYER':
      return '/lawyer/dashboard';
    case 'COORDINATOR':
      return '/coordinator/dashboard';
    case 'CLIENT':
      return '/client/dashboard';
    default:
      return '/';
  }
}

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [formData, setFormData] = useState<LoginForm>({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.identifier,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem('token', data.token);
        document.cookie = `auth-token=${data.token}; path=/;`;

        // Get role-based redirect URL
        const callbackUrl = getRoleBasedRedirect(data.user.userRole);
        
        // Use router for client-side navigation
        router.push(callbackUrl);
      } else {
        setError(data.error || 'Login failed');
        showToast(data.error || 'you should have to enter all required field', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('An error occurred during login.. make sure you are connected to internet or ' );
      showToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <MatrixBackground />
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Welcome Back to DU LAS</h2>
          <p className="text-secondary">
            Please login to your account
          </p>

          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Email or Phone"
              value={formData.identifier}
              onChange={(e) => setFormData({
                ...formData,
                identifier: e.target.value
              })}
            />
            <div className="input-highlight"></div>
          </div>

          <div className="form-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({
                  ...formData,
                  password: e.target.value
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="input-highlight"></div>
            {error && <span className="error-text">{error}</span>}
          </div>

          <div className="form-actions">
            <label className="checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <Link href="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="auth-link">
            Don't have an account? <Link href="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
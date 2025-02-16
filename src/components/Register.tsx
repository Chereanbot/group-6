"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MatrixBackground from './MatrixBackground';
import { registerUser } from '@/utils/auth';
import { showToast, hideToast } from '@/utils/toast';

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    // Full Name validation
    if (!formData.fullName || formData.fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }
    
    // Username validation
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Phone validation
    const phoneRegex = /^\+?[1-9]\d{9,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const loadingToast = showToast('Creating your account...', 'loading');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      hideToast(loadingToast);
      showToast('Registration successful!', 'success');
      
      // Store userId for OTP verification
      window.sessionStorage.setItem('userId', data.userId);
      window.sessionStorage.setItem('verifyType', 'EMAIL');
      
      router.push('/verify-otp');
      
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <MatrixBackground />
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form register-form">
          <h2>Create Account</h2>
          <p className="text-secondary">Join our community</p>
          
          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <input
              type="email"
              className="input-field"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              className="input-field"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              className="input-field"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="auth-link">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register; 
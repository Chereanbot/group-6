import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Show loading state
      const loadingToast = showToast('Registering...', 'loading');
      
      // Simulate API call
      await registerUser(formData);
      
      // Hide loading toast
      hideToast(loadingToast);
      
      // Show success message
      showToast('Registration successful!', 'success');
      
      // Navigate to OTP verification
      navigate('/verify-otp');
      
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="auth-container fade-in">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create Account</h2>
        
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

        {/* Similar input fields for email, phone, password, confirmPassword */}
        
        <button type="submit" className="btn btn-primary">
          Register
        </button>
        
        <p className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register; 
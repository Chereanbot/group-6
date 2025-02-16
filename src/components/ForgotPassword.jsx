import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateIdentifier = () => {
    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(identifier);
    } else {
      const phoneRegex = /^\+?[1-9]\d{9,11}$/;
      return phoneRegex.test(identifier);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateIdentifier()) {
      setError(`Please enter a valid ${method}`);
      return;
    }

    try {
      setIsLoading(true);
      const loadingToast = showToast('Sending recovery code...', 'loading');

      // Simulate API call to send recovery code
      await sendRecoveryCode(method, identifier);

      hideToast(loadingToast);
      showToast(`Recovery code sent to your ${method}`, 'success');
      
      // Store the recovery method and identifier for the verification step
      sessionStorage.setItem('recoveryMethod', method);
      sessionStorage.setItem('recoveryIdentifier', identifier);
      
      navigate('/verify-otp');

    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Reset Password</h2>
        <p className="text-secondary">
          Choose how you want to reset your password
        </p>

        <div className="method-selector">
          <button
            type="button"
            className={`method-btn ${method === 'email' ? 'active' : ''}`}
            onClick={() => setMethod('email')}
          >
            <i className="fas fa-envelope"></i>
            Email
          </button>
          <button
            type="button"
            className={`method-btn ${method === 'phone' ? 'active' : ''}`}
            onClick={() => setMethod('phone')}
          >
            <i className="fas fa-phone"></i>
            Phone
          </button>
        </div>

        <div className="form-group">
          <input
            type={method === 'email' ? 'email' : 'tel'}
            className="input-field"
            placeholder={method === 'email' ? 'Enter your email' : 'Enter your phone number'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {error && <span className="error-text">{error}</span>}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Recovery Code'}
        </button>

        <p className="auth-link">
          Remember your password? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword; 
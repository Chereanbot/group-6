import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if user came from OTP verification
  useEffect(() => {
    const recoveryMethod = sessionStorage.getItem('recoveryMethod');
    const recoveryIdentifier = sessionStorage.getItem('recoveryIdentifier');
    
    if (!recoveryMethod || !recoveryIdentifier) {
      navigate('/forgot-password');
      showToast('Please start the recovery process again', 'error');
    }
  }, [navigate]);

  const validatePassword = () => {
    const newErrors = {};
    
    // Password strength validation
    if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    // Check for at least one number
    if (!/\d/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character';
    }
    
    // Password match validation
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    try {
      setIsLoading(true);
      const loadingToast = showToast('Updating password...', 'loading');

      const identifier = sessionStorage.getItem('recoveryIdentifier');
      
      // API call to reset password
      await resetPassword(identifier, formData.newPassword);
      
      hideToast(loadingToast);
      showToast('Password updated successfully!', 'success');
      
      // Clear recovery data
      sessionStorage.removeItem('recoveryMethod');
      sessionStorage.removeItem('recoveryIdentifier');
      
      // Redirect to login
      navigate('/login');
      
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Set New Password</h2>
        <p className="text-secondary">
          Please enter your new password
        </p>

        <div className="form-group">
          <input
            type="password"
            className="input-field"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={(e) => setFormData({
              ...formData,
              newPassword: e.target.value
            })}
          />
          {errors.newPassword && (
            <span className="error-text">{errors.newPassword}</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="password"
            className="input-field"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({
              ...formData,
              confirmPassword: e.target.value
            })}
          />
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}
        </div>

        <div className="password-requirements">
          <p>Password must contain:</p>
          <ul>
            <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
              At least 8 characters
            </li>
            <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
              At least one number
            </li>
            <li className={/[!@#$%^&*]/.test(formData.newPassword) ? 'valid' : ''}>
              At least one special character
            </li>
          </ul>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword; 
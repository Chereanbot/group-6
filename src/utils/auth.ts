import jwt from 'jsonwebtoken';
import { showToast } from './toast';

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store the token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (data: RegisterData) => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token verified:', decoded); // Debug log
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

export const showAuthError = (error: string) => {
  showToast(error, 'error');
};

export const showAuthSuccess = (message: string) => {
  showToast(message, 'success');
};

export const showAuthLoading = (message: string) => {
  return showToast(message, 'loading');
};

export const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Try to get token from localStorage first
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // If no token in localStorage, try to get from cookie
  if (!token && typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
    if (authCookie) {
      token = authCookie.split('=')[1].trim();
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}; 
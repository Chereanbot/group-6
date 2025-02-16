import jwt from 'jsonwebtoken';

export const loginUser = async (credentials) => {
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

    // Store the token in both localStorage and cookie
    if (data.token) {
      localStorage.setItem('token', data.token);
      // Set cookie
      document.cookie = `token=${data.token}; path=/; max-age=86400`; // 24 hours
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 
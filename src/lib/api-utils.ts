export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get token from cookies
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))?.split('=')[1] ||
    document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))?.split('=')[1] ||
    document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))?.split('=')[1];

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
} 
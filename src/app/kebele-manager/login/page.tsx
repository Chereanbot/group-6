"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineOfficeBuilding, HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi';

export default function KebeleManagerLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    username: '',
    kebeleId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coordinator/kebele-manager/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          kebeleId: credentials.kebeleId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store manager data in localStorage
      localStorage.setItem('managerId', data.id);
      localStorage.setItem('kebeleId', data.kebele.id);
      localStorage.setItem('managerName', data.fullName);
      localStorage.setItem('kebeleName', data.kebele.kebeleName);

      // Redirect to dashboard
      router.push('/kebele-manager/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <HiOutlineOfficeBuilding className="mx-auto h-12 w-12 text-primary-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Kebele Manager Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your kebele management dashboard
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email or Phone
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                    dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your email or phone"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="kebeleId" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Kebele ID
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="kebeleId"
                  name="kebeleId"
                  type="text"
                  required
                  value={credentials.kebeleId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, kebeleId: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                    dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your kebele ID"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 
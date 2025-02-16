'use client';

import { useEffect } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (error) {
      console.error('Uncaught error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-10 text-center backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl">
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-red-500/20 rounded-full blur-xl"></div>
            <HiOutlineExclamationCircle className="relative mx-auto h-20 w-20 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Oops! Something went wrong
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {error?.message || 'An unexpected error occurred. Please check if all required data is available and try again.'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex justify-center py-3 px-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Return to home
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error?.stack && (
          <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200 font-mono whitespace-pre-wrap">
              {error.stack}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
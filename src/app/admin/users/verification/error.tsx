'use client';

import { useEffect } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function VerificationError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 text-center">
      <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-red-500" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        Something went wrong
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {error.message}
      </p>
      <div className="mt-6">
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 
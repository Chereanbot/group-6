'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 absolute top-0"></div>
      </div>
      <div className="mt-4 text-xl font-semibold text-primary-600">
        DU LADS
      </div>
      <div className="text-sm text-gray-500 animate-pulse">
        Loading...
      </div>
    </div>
  );
}

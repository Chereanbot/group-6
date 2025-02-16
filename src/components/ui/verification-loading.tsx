export default function VerificationLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="animate-pulse h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex space-x-4">
            <div className="animate-pulse h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="animate-pulse h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
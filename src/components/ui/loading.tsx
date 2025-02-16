export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="absolute animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-primary-500"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-2">
          <div className="animate-pulse rounded-full h-12 w-12 bg-primary-200"></div>
        </div>
        
        {/* Middle spinning ring */}
        <div className="absolute inset-1 animate-spin rounded-full h-14 w-14 border-4 border-l-transparent border-primary-400" style={{animationDirection: 'reverse'}}></div>
        
        {/* Center dot */}
        <div className="absolute inset-5">
          <div className="animate-bounce rounded-full h-6 w-6 bg-primary-600"></div>
        </div>
      </div>
    </div>
  );
}
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-4">
          You do not have permission to access this page.
        </p>
        <a
          href="/login"
          className="block w-full text-center bg-primary-600 text-white rounded-md px-4 py-2 hover:bg-primary-700"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
} 
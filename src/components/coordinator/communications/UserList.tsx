import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineOfficeBuilding, HiOutlineShieldCheck, HiOutlineX } from 'react-icons/hi';

type UserRole = 'COORDINATOR' | 'ADMIN' | 'SUPER_ADMIN';

type User = {
  id: string;
  fullName: string;
  email: string;
  userRole: UserRole;
  isOnline: boolean;
  lastSeen: Date | null;
  coordinatorProfile?: {
    office?: {
      name: string;
    };
  };
  unreadCount?: number;
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
};

interface UserListProps {
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export default function UserList({ onSelectUser, onClose }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'coordinator' | 'admin'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const queryParams = new URLSearchParams({
          search: search,
          role: filter.toUpperCase(),
        });
        
        const response = await fetch(`/api/users/chat?${queryParams.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        
        const filteredUsers = data.filter((user: User) => {
          if (filter === 'all') return true;
          if (filter === 'coordinator') return user.userRole === 'COORDINATOR';
          if (filter === 'admin') return user.userRole === 'ADMIN' || user.userRole === 'SUPER_ADMIN';
          return true;
        });

        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [search, filter]);

  const formatLastSeen = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
        >
          <HiOutlineX className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or office..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
          />
          <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('coordinator')}
            className={`px-3 py-1 rounded-full text-sm flex items-center ${
              filter === 'coordinator'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <HiOutlineOfficeBuilding className="w-4 h-4 mr-1" />
            Coordinators
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-3 py-1 rounded-full text-sm flex items-center ${
              filter === 'admin'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <HiOutlineShieldCheck className="w-4 h-4 mr-1" />
            Admins
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center 
                  justify-between transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 
                      flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {user.fullName.charAt(0)}
                      </span>
                    </div>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
                        border-2 border-white dark:border-gray-900" />
                    )}
                  </div>
                  <div className="ml-4 text-left">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900 dark:text-white">{user.fullName}</h3>
                      {user.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-primary-500 text-white rounded-full">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {user.userRole.toLowerCase()} • {user.coordinatorProfile?.office?.name || 'Head Office'}
                    </p>
                    {!user.isOnline && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last seen: {formatLastSeen(user.lastSeen)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
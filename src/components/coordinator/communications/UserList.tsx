import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineOfficeBuilding, HiOutlineShieldCheck, HiOutlineX, HiOutlineUserGroup } from 'react-icons/hi';
import { CommunicationUser } from './types';
import { toast } from 'react-hot-toast';

type UserRole = 'COORDINATOR' | 'ADMIN' | 'SUPER_ADMIN' | 'LAWYER' | 'CLIENT';

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
  onSelectUser: (user: CommunicationUser) => void;
  onClose: () => void;
}

export default function UserList({ onSelectUser, onClose }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'coordinator' | 'admin' | 'lawyer' | 'client'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/coordinator/communications/users', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }

        const data = await response.json();
        
        // Combine all users into a single array and add necessary fields
        const allUsers = [
          ...(data.admins || []).map((user: any) => ({
            ...user,
            type: 'admin'
          })),
          ...(data.lawyers || []).map((user: any) => ({
            ...user,
            type: 'lawyer'
          })),
          ...(data.clients || []).map((user: any) => ({
            ...user,
            type: 'client'
          }))
        ];

        // Filter users based on role and search term
        const filteredUsers = allUsers.filter(user => {
          // Role filter
          if (filter !== 'all') {
            if (filter === 'admin' && !['ADMIN', 'SUPER_ADMIN'].includes(user.userRole)) return false;
            if (filter === 'lawyer' && user.userRole !== 'LAWYER') return false;
            if (filter === 'client' && user.userRole !== 'CLIENT') return false;
            if (filter === 'coordinator' && user.userRole !== 'COORDINATOR') return false;
          }

          // Search filter
          if (search) {
            const searchLower = search.toLowerCase();
            return (
              user.fullName.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower) ||
              (user.coordinatorProfile?.office?.name || '').toLowerCase().includes(searchLower)
            );
          }

          return true;
        });

        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch users');
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

  const handleUserSelect = (user: User) => {
    if (selectedUserId === user.id) return; // Prevent duplicate selections
    setSelectedUserId(user.id);
    onSelectUser(user as CommunicationUser);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Select User</h2>
        <div className="mt-4 space-y-4">
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

          <div className="flex flex-wrap gap-2">
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
              onClick={() => setFilter('lawyer')}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                filter === 'lawyer'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <HiOutlineOfficeBuilding className="w-4 h-4 mr-1" />
              Lawyers
            </button>
            <button
              onClick={() => setFilter('client')}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                filter === 'client'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <HiOutlineUserGroup className="w-4 h-4 mr-1" />
              Clients
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
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                disabled={selectedUserId === user.id}
                className={`w-full p-4 flex items-center space-x-4 transition-colors duration-200
                  ${selectedUserId === user.id 
                    ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <div className="relative flex-shrink-0">
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
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {user.userRole.toLowerCase()} • {user.coordinatorProfile?.office?.name || 'Head Office'}
                  </p>
                  {!user.isOnline && user.lastSeen && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last seen: {formatLastSeen(user.lastSeen)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 
            hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
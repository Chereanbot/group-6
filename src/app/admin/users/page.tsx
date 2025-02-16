"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { userService } from '@/services/user.service';
import { motion } from 'framer-motion';
import {
  HiOutlineUserAdd,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineChartPie,
  HiOutlineShieldCheck,
  HiOutlineDocumentReport,
  HiOutlineBell,
  HiOutlineExclamation,
  HiOutlinePencil,
  HiOutlineDotsVertical,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineBan,
  HiOutlineTrash
} from 'react-icons/hi';
import UserTable from '@/components/admin/users/UserTable';
import EditUserModal from '@/components/admin/users/EditUserModal';
import { toast } from 'react-hot-toast';
import AddUserModal from '@/components/admin/users/AddUserModal';
import { User } from '@/types/case.types';
import { UserStatus } from '@prisma/client';
import { Role } from '@/services/role.service';

interface UserStats {
  total: number;
  active: number;
  pending: number;
  blocked: number;
  newToday: number;
}

function TabButton({ 
  children, 
  active = false, 
  role = 'all', 
  onRoleSelect 
}: { 
  children: React.ReactNode;
  active?: boolean;
  role?: string;
  onRoleSelect: (role: string) => void;
}) {
  return (
    <button
      onClick={() => onRoleSelect(role)}
      className={`px-4 py-2 text-sm font-medium ${
        active
          ? 'border-b-2 border-primary-500 text-primary-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAdmin();
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    pending: 0,
    blocked: 0,
    newToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load users
      const usersResponse = await userService.getAllUsers();
      setUsers(usersResponse.data);

      // Load stats separately
      try {
        const statsResponse = await userService.getUserStats();
        if (statsResponse.overview) {
          setStats(statsResponse.overview);
        }
      } catch (statsError) {
        console.error('Failed to load stats:', statsError);
        // Set default stats
        setStats({
          total: usersResponse.total || 0,
          active: 0,
          pending: 0,
          blocked: 0,
          newToday: 0
        });
      }

    } catch (err: any) {
      console.error('Failed to load user data:', err);
      setError(err.message || 'Failed to load users');
      
      if (err.message === 'Unauthorized access') {
        router.push('/login?redirect=/admin/users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/users');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        loadUserData(selectedRole);
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleBanUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      try {
        await userService.updateUserStatus(userId, 'BANNED');
        loadUserData(selectedRole);
        toast.success('User banned successfully');
      } catch (error) {
        toast.error('Failed to ban user');
      }
    }
  };

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    try {
      await userService.updateUserStatus(userId, status);
      loadUserData(selectedRole);
      toast.success(`User status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await userService.updateUserRole(userId, role);
      loadUserData(selectedRole);
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    loadUserData(role);
  };

  const handleAddUser = async (userData: any) => {
    try {
      const response = await userService.registerUser(userData);
      if (response.success) {
        await loadUserData(selectedRole);
        toast.success('User created successfully');
        setShowAddModal(false);
      } else {
        toast.error(response.error || 'Failed to create user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
      console.error('Error creating user:', error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all user accounts
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg
            hover:bg-primary-600 transition-colors"
        >
          <HiOutlineUserAdd className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.total}
          icon={HiOutlineChartPie}
          trend={+15}
        />
        <StatsCard
          title="Active Users"
          value={stats.active}
          icon={HiOutlineShieldCheck}
          trend={+8}
          type="success"
        />
        <StatsCard
          title="Pending Verification"
          value={stats.pending}
          icon={HiOutlineBell}
          trend={-3}
          type="warning"
        />
        <StatsCard
          title="Blocked Users"
          value={stats.blocked}
          icon={HiOutlineExclamation}
          trend={+2}
          type="danger"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Pending Verifications"
          count={stats.pending}
          path="/admin/users/verification"
          description="Users awaiting verification"
        />
        <QuickActionCard
          title="Security Alerts"
          count={5}
          path="/admin/users/security"
          description="Recent security incidents"
        />
        <QuickActionCard
          title="Access Requests"
          count={8}
          path="/admin/users/access"
          description="Pending access requests"
        />
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <TabButton 
              active={selectedRole === 'all'} 
              role="all" 
              onRoleSelect={handleRoleFilter}
            >
              All Users
            </TabButton>
            <TabButton 
              active={selectedRole === 'SUPER_ADMIN'} 
              role="SUPER_ADMIN" 
              onRoleSelect={handleRoleFilter}
            >
              Super Admins
            </TabButton>
            <TabButton 
              active={selectedRole === 'ADMIN'} 
              role="ADMIN" 
              onRoleSelect={handleRoleFilter}
            >
              Admins
            </TabButton>
            <TabButton 
              active={selectedRole === 'LAWYER'} 
              role="LAWYER" 
              onRoleSelect={handleRoleFilter}
            >
              Lawyers
            </TabButton>
            <TabButton 
              active={selectedRole === 'CLIENT'} 
              role="CLIENT" 
              onRoleSelect={handleRoleFilter}
            >
              Clients
            </TabButton>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-4 flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-700 
                dark:border-gray-600 dark:text-gray-200"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg 
            flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-600">
            <HiOutlineFilter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <UserTable 
            users={users} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser}
            onBan={handleBanUser}
            onStatusChange={handleStatusChange}
            onRoleChange={handleRoleChange}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* Activity items */}
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={async (updatedUser) => {
            try {
              await userService.updateUser(selectedUser.id, updatedUser);
              loadUserData(selectedRole);
              setShowEditModal(false);
              setSelectedUser(null);
              toast.success('User updated successfully');
            } catch (error) {
              toast.error('Failed to update user');
            }
          }}
        />
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddUser}
        />
      )}
    </div>
  );
}

// Helper Components
function StatsCard({ title, value, icon: Icon, trend, type = 'default' }: { title: string, value: number, icon: React.ElementType, trend: number, type: string }) {
  const colors = {
    default: 'bg-blue-100 text-black dark:bg-blue-900/40 dark:text-blue-200',
    success: 'bg-green-100 text-black dark:bg-green-900/40 dark:text-green-200',
    warning: 'bg-yellow-100 text-black dark:bg-yellow-900/40 dark:text-yellow-200',
    danger: 'bg-red-100 text-black dark:bg-red-900/40 dark:text-red-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-black dark:text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${colors[type as keyof typeof colors]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4">
        <span className={trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
        <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
      </div>
    </div>
  );
}

function QuickActionCard({ title, count, path, description }: { title: string, count: number, path: string, description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer"
    >
      <h3 className="font-semibold text-black dark:text-white">{title}</h3>
      <div className="mt-2 text-3xl font-bold text-black dark:text-white">{count}</div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
} 
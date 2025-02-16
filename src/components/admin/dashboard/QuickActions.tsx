"use client";

import { HiOutlinePlus, HiOutlineUserAdd, HiOutlineDocumentAdd, HiOutlineCog } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

const QuickActions = () => {
  const router = useRouter();

  const actions = [
    {
      title: 'New Case',
      icon: <HiOutlinePlus className="w-6 h-6" />,
      description: 'Create a new legal case',
      href: '/admin/cases/new',
      color: 'bg-blue-500'
    },
    {
      title: 'Add User',
      icon: <HiOutlineUserAdd className="w-6 h-6" />,
      description: 'Register new user',
      href: '/admin/users/new',
      color: 'bg-green-500'
    },
    {
      title: 'New Service',
      icon: <HiOutlineDocumentAdd className="w-6 h-6" />,
      description: 'Create service package',
      href: '/admin/services/new',
      color: 'bg-purple-500'
    },
    {
      title: 'Settings',
      icon: <HiOutlineCog className="w-6 h-6" />,
      description: 'System configuration',
      href: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.title}
          onClick={() => router.push(action.href)}
          className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-all"
        >
          <div className={`w-12 h-12 rounded-lg ${action.color} text-white flex items-center justify-center mb-4`}>
            {action.icon}
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {action.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {action.description}
          </p>
        </button>
      ))}
    </div>
  );
};

export default QuickActions; 
"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  HiDotsVertical,
  HiOutlineShare,
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDuplicate
} from 'react-icons/hi';

interface MoreOptionsMenuProps {
  options?: {
    label: string;
    icon: JSX.Element;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }[];
}

export const MoreOptionsMenu = ({ options = [] }: MoreOptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const defaultOptions = [
    {
      label: 'Share',
      icon: <HiOutlineShare className="w-5 h-5" />,
      onClick: () => console.log('Share clicked')
    },
    {
      label: 'Download',
      icon: <HiOutlineDownload className="w-5 h-5" />,
      onClick: () => console.log('Download clicked')
    },
    {
      label: 'Edit',
      icon: <HiOutlinePencil className="w-5 h-5" />,
      onClick: () => console.log('Edit clicked')
    },
    {
      label: 'Duplicate',
      icon: <HiOutlineDuplicate className="w-5 h-5" />,
      onClick: () => console.log('Duplicate clicked')
    },
    {
      label: 'Delete',
      icon: <HiOutlineTrash className="w-5 h-5" />,
      onClick: () => console.log('Delete clicked'),
      variant: 'danger'
    }
  ];

  const menuOptions = options.length > 0 ? options : defaultOptions;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
          text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
          focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <HiDotsVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 
          shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-2">
          {menuOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left flex items-center space-x-2
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${option.variant === 'danger' 
                  ? 'text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400' 
                  : 'text-gray-700 dark:text-gray-300'}`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 
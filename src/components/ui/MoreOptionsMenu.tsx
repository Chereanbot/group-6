"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  HiDotsVertical,
  HiOutlineShare,
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDuplicate,
  HiOutlineArchive,
  HiOutlineFlag,
  HiOutlineStar
} from 'react-icons/hi';

interface MoreOptionsMenuProps {
  options?: {
    label: string;
    icon: JSX.Element;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'warning' | 'success';
    shortcut?: string;
    description?: string;
    disabled?: boolean;
    divider?: boolean;
  }[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  triggerClassName?: string;
  menuClassName?: string;
  onOpenChange?: (open: boolean) => void;
}

export const MoreOptionsMenu = ({ 
  options = [], 
  position = 'bottom',
  triggerClassName = '',
  menuClassName = '',
  onOpenChange
}: MoreOptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const defaultOptions = [
    {
      label: 'Share',
      icon: <HiOutlineShare className="w-5 h-5" />,
      onClick: () => console.log('Share clicked'),
      shortcut: '⌘S'
    },
    {
      label: 'Download',
      icon: <HiOutlineDownload className="w-5 h-5" />,
      onClick: () => console.log('Download clicked'),
      shortcut: '⌘D'
    },
    {
      label: 'Edit',
      icon: <HiOutlinePencil className="w-5 h-5" />,
      onClick: () => console.log('Edit clicked'),
      shortcut: '⌘E'
    },
    {
      label: 'Duplicate',
      icon: <HiOutlineDuplicate className="w-5 h-5" />,
      onClick: () => console.log('Duplicate clicked'),
      shortcut: '⌘⇧D'
    },
    { divider: true },
    {
      label: 'Archive',
      icon: <HiOutlineArchive className="w-5 h-5" />,
      onClick: () => console.log('Archive clicked'),
      variant: 'warning'
    },
    {
      label: 'Flag',
      icon: <HiOutlineFlag className="w-5 h-5" />,
      onClick: () => console.log('Flag clicked'),
      variant: 'success'
    },
    {
      label: 'Delete',
      icon: <HiOutlineTrash className="w-5 h-5" />,
      onClick: () => console.log('Delete clicked'),
      variant: 'danger',
      shortcut: '⌘⌫'
    }
  ];

  const menuOptions = options.length > 0 ? options : defaultOptions;

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'top-full mt-2';
    }
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400';
      case 'warning':
        return 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400';
      case 'success':
        return 'text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
          text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
          focus:outline-none focus:ring-2 focus:ring-primary-500 ${triggerClassName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <HiDotsVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          className={`absolute ${getPositionClasses()} right-0 w-56 rounded-lg 
            bg-white dark:bg-gray-800 shadow-lg border border-gray-200 
            dark:border-gray-700 z-50 py-2 ${menuClassName}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          {menuOptions.map((option, index) => (
            <div key={index}>
              {option.divider ? (
                <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
              ) : (
                <button
                  onClick={() => {
                    option.onClick();
                    setIsOpen(false);
                  }}
                  disabled={option.disabled}
                  className={`w-full px-4 py-2 text-left flex items-center justify-between
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${getVariantClasses(option.variant)}
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  role="menuitem"
                  aria-disabled={option.disabled}
                >
                  <div className="flex items-center space-x-2">
                    {option.icon}
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {option.shortcut && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {option.shortcut}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 
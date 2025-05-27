"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  HiHome,
  HiUserGroup,
  HiScale,
  HiDocumentText,
  HiPhone,
  HiMenu,
  HiX,
} from 'react-icons/hi';

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Home', icon: HiHome },
    { href: '/about', label: 'About', icon: HiUserGroup },
    { href: '/services', label: 'Services', icon: HiScale },
    { href: '/cases', label: 'Cases', icon: HiDocumentText },
    { href: '/contact', label: 'Contact', icon: HiPhone },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative px-4 py-2 rounded-lg transition-all duration-300 ${
              isActive(item.href)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
            {isActive(item.href) && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors ${
                        isActive(item.href) ? 'text-blue-600 bg-blue-50' : ''
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationMenu; 
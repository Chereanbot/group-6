"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineBookOpen,
  HiOutlineStar,
  HiOutlinePhone,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
} from 'react-icons/hi';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { title: 'Home', href: '/', icon: <HiOutlineHome className="w-5 h-5" /> },
    { title: 'About', href: '/about', icon: <HiOutlineInformationCircle className="w-5 h-5" /> },
    { title: 'Services', href: '/services', icon: <HiOutlineScale className="w-5 h-5" /> },
    { title: 'Documents', href: '/documents', icon: <HiOutlineDocumentText className="w-5 h-5" /> },
    { title: 'Rules', href: '/rules', icon: <HiOutlineBookOpen className="w-5 h-5" /> },
    { title: 'Feedback', href: '/feedback', icon: <HiOutlineStar className="w-5 h-5" /> },
    { title: 'Contact', href: '/contact', icon: <HiOutlinePhone className="w-5 h-5" /> }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg' 
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <motion.img 
                  src="/images/logo.png" 
                  alt="Dilla University Legal Aid Service"
                  className="h-12 w-auto rounded-lg shadow-lg"
                  initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  whileHover={{ 
                    scale: 1.05,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                />
                <motion.span 
                  className="ml-3 text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 
                    bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Du Las
                </motion.span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium
                        transition-colors relative group ${
                          isActive 
                            ? 'text-primary-600 dark:text-primary-400' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                    >
                      <span className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </span>
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                          layoutId="navbar-indicator"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              
              {/* Login Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="ml-4 inline-flex items-center justify-center px-4 py-2 rounded-lg
                    bg-primary-600 text-white font-medium hover:bg-primary-700 
                    transition-colors shadow-md hover:shadow-lg"
                >
                  <HiOutlineUser className="w-5 h-5 mr-2" />
                  Login
                </Link>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400
                  hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {isOpen ? (
                  <HiOutlineX className="block h-6 w-6" />
                ) : (
                  <HiOutlineMenu className="block h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white dark:bg-gray-900"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-lg text-base font-medium
                          transition-colors ${
                            isActive
                              ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-2 rounded-lg
                      bg-primary-600 text-white font-medium hover:bg-primary-700 
                      transition-colors shadow-md mx-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <HiOutlineUser className="w-5 h-5 mr-2" />
                    Login
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}; 
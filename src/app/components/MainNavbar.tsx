"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  HiHome,
  HiInformationCircle,
  HiScale,
  HiDocumentText,
  HiPhone,
  HiMenu,
  HiX,
  HiUser,
  HiCog,
  HiOutlineSearch,
  HiSun,
  HiMoon,
  HiBookOpen
} from 'react-icons/hi';

const MainNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navItems = [
    { title: 'Home', href: '/', icon: <HiHome className="w-5 h-5" /> },
    { title: 'About', href: '/about', icon: <HiInformationCircle className="w-5 h-5" /> },
    { title: 'Services', href: '/services', icon: <HiScale className="w-5 h-5" /> },
    { title: 'Documents', href: '/documents', icon: <HiDocumentText className="w-5 h-5" /> },
    { title: 'Rules', href: '/rules', icon: <HiBookOpen className="w-5 h-5" /> },
    { title: 'Contact', href: '/contact', icon: <HiPhone className="w-5 h-5" /> },
 
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="relative"
              >
                <motion.img
                  src="/images/logo.png"
                  alt="Logo"
                  className="h-12 w-auto rounded-lg"
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                />
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg opacity-30 blur-sm"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </motion.div>
              <motion.span 
                className="font-bold text-2xl"
                animate={{
                  background: isScrolled
                    ? ['linear-gradient(to right, #3B82F6, #10B981)', 'linear-gradient(to right, #10B981, #3B82F6)']
                    : ['linear-gradient(to right, #ffffff, #e2e8f0)', 'linear-gradient(to right, #e2e8f0, #ffffff)']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                DU LAS
              </motion.span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <motion.div 
              animate={{ width: searchOpen ? 'auto' : '40px' }}
              className="relative"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full ${
                  isScrolled ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white/10'
                }`}
              >
                <HiOutlineSearch className={`w-5 h-5 ${
                  isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white'
                }`} />
              </motion.button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '200px', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text"
                    placeholder="Search..."
                    className={`absolute right-0 top-0 h-full rounded-full pl-4 pr-10 outline-none ${
                      isScrolled 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                        : 'bg-white/10 text-white placeholder-white/60'
                    }`}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {navItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-300 relative overflow-hidden group ${
                      isScrolled
                        ? 'text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400'
                        : 'text-white hover:text-primary-400'
                    }`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 
                      rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  {item.icon}
                  <span className="ml-2 relative z-10">{item.title}</span>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary-500"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            ))}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${
                isScrolled ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white/10'
              }`}
            >
              {isDarkMode ? (
                <HiSun className={`w-5 h-5 ${
                  isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white'
                }`} />
              ) : (
                <HiMoon className={`w-5 h-5 ${
                  isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white'
                }`} />
              )}
            </motion.button>

            {/* Login Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/login">
                <motion.button
                  className={`flex items-center px-6 py-2.5 rounded-lg font-medium
                    transition-all duration-300 relative overflow-hidden group ${
                      isScrolled
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                    }`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <HiUser className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Login</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${
              isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'
            }`}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiX className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiMenu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item, index) => (
                <Link key={item.title} href={item.href}>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.05)' }}
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 
                      rounded-lg relative overflow-hidden group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    {item.icon}
                    <span className="ml-2 relative z-10">{item.title}</span>
                  </motion.div>
                </Link>
              ))}
              <Link href="/login">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center px-4 py-3 text-white bg-primary-600 
                    rounded-lg relative overflow-hidden group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <HiUser className="w-5 h-5 relative z-10" />
                  <span className="ml-2 relative z-10">Login</span>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default MainNavbar;

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
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
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineChevronDown,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineChatAlt2,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineCollection,
  HiOutlineGlobe,
  HiOutlineLightBulb,
  HiOutlineShieldCheck,
  HiOutlineSupport
} from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { 
      title: 'Home', 
      href: '/', 
      icon: <HiOutlineHome className="w-5 h-5" /> 
    },
    { 
      title: 'About', 
      href: '/about', 
      icon: <HiOutlineInformationCircle className="w-5 h-5" />,
      dropdownItems: [
        { title: 'Our Mission', href: '/about#mission', icon: <HiOutlineLightBulb className="w-5 h-5" /> },
        { title: 'Our Team', href: '/about#team', icon: <HiOutlineUserGroup className="w-5 h-5" /> },
        { title: 'History', href: '/about#history', icon: <HiOutlineAcademicCap className="w-5 h-5" /> },
        { title: 'Partners', href: '/about#partners', icon: <HiOutlineGlobe className="w-5 h-5" /> }
      ]
    },
    { 
      title: 'Services', 
      href: '/services', 
      icon: <HiOutlineScale className="w-5 h-5" />,
      dropdownItems: [
        { title: 'Legal Consultation', href: '/services/consultation', icon: <HiOutlineChatAlt2 className="w-5 h-5" /> },
        { title: 'Document Review', href: '/services/document-review', icon: <HiOutlineClipboardList className="w-5 h-5" /> },
        { title: 'Court Representation', href: '/services/court-representation', icon: <HiOutlineBriefcase className="w-5 h-5" /> },
        { title: 'Legal Support', href: '/services/legal-support', icon: <HiOutlineSupport className="w-5 h-5" /> }
      ]
    },
    { 
      title: 'Resources', 
      href: '/resources', 
      icon: <HiOutlineCollection className="w-5 h-5" />,
      dropdownItems: [
        { title: 'Documents', href: '/documents', icon: <HiOutlineDocumentText className="w-5 h-5" /> },
        { title: 'Rules & Regulations', href: '/rules', icon: <HiOutlineShieldCheck className="w-5 h-5" /> },
        { title: 'Settings', href: '/settings', icon: <HiOutlineCog className="w-5 h-5" /> }
      ]
    },
    { title: 'Contact', href: '/contact', icon: <HiOutlinePhone className="w-5 h-5" /> }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownEnter = (title: string) => {
    setActiveDropdown(title);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  // Add new animation variants
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }),
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      transformOrigin: "top"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const dropdownItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    hover: {
      x: 8,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <>
      <nav 
        className={`fixed w-full z-50 top-0 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg' 
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <motion.div
                  className="relative"
                  variants={logoVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <motion.img 
                    src="/images/logo.png" 
                    alt="Dilla University Legal Aid Service"
                    className="h-12 w-auto rounded-lg shadow-lg"
                  />
                  <motion.div
                    className="absolute -inset-2 bg-primary-500/20 rounded-lg blur-lg"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </motion.div>
                <div className="ml-3">
                  <motion.span 
                    className="block text-xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-primary-800 
                      bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Du Las
                  </motion.span>
                  <motion.span
                    className="block text-sm text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Legal Aid Service
                  </motion.span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div 
                    key={item.href}
                    className="relative"
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    onMouseEnter={() => item.dropdownItems && handleDropdownEnter(item.title)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <motion.div
                      whileHover="hover"
                      variants={navItemVariants}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-200 relative group ${
                            isActive 
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                              : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                      >
                        <motion.span 
                          className="flex items-center"
                          whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <motion.span
                            className="mr-2"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            {item.icon}
                          </motion.span>
                          <span>{item.title}</span>
                          {item.dropdownItems && (
                            <motion.span
                              animate={{ rotate: activeDropdown === item.title ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="ml-1"
                            >
                              <HiOutlineChevronDown className="w-4 h-4" />
                            </motion.span>
                          )}
                        </motion.span>
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                            layoutId="activeIndicator"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>

                    {/* Dropdown Menu */}
                    {item.dropdownItems && (
                      <AnimatePresence>
                        {activeDropdown === item.title && (
                          <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute left-0 mt-2 w-64 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
                          >
                            <div className="p-2 space-y-1">
                              {item.dropdownItems.map((dropdownItem) => (
                                <motion.div
                                  key={dropdownItem.href}
                                  variants={dropdownItemVariants}
                                  whileHover="hover"
                                  className="relative group"
                                >
                                  <Link
                                    href={dropdownItem.href}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                      rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 
                                      group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                                  >
                                    <motion.span
                                      className="mr-3"
                                      whileHover={{ rotate: 360, scale: 1.2 }}
                                      transition={{ duration: 0.5 }}
                                    >
                                      {dropdownItem.icon}
                                    </motion.span>
                                    <span>{dropdownItem.title}</span>
                                  </Link>
                                  <motion.div
                                    className="absolute bottom-0 left-0 h-px bg-primary-500"
                                    initial={{ width: "0%" }}
                                    whileHover={{ width: "100%" }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                );
              })}

              {/* Theme Toggle & Login Button */}
              <motion.div 
                className="flex items-center space-x-4 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9, rotate: 360 }}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                    dark:hover:bg-gray-800 transition-colors overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      rotate: theme === 'dark' ? 0 : 180,
                    }}
                    transition={{ duration: 0.6, type: "spring" }}
                  >
                    {theme === 'dark' ? (
                      <HiOutlineSun className="w-5 h-5" />
                    ) : (
                      <HiOutlineMoon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-primary-500/10"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="relative inline-flex items-center px-6 py-2 rounded-lg overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                    <motion.span 
                      className="relative flex items-center text-white"
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <motion.span
                        className="mr-2"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <HiOutlineUser className="w-5 h-5" />
                      </motion.span>
                      <span>Login</span>
                    </motion.span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <motion.div 
              className="flex items-center lg:hidden"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                  dark:hover:bg-gray-800 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <HiOutlineX className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <HiOutlineMenu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  className="absolute inset-0 rounded-lg bg-primary-500/10"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: "auto", 
                opacity: 1,
                transition: {
                  height: { type: "spring", stiffness: 400, damping: 30 },
                  opacity: { duration: 0.2 }
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: {
                  height: { type: "spring", stiffness: 400, damping: 30 },
                  opacity: { duration: 0.2 }
                }
              }}
              className="lg:hidden overflow-hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
            >
              <motion.div 
                className="px-2 pt-2 pb-3 space-y-1"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                {navItems.map((item, index) => (
                  <motion.div 
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 24
                        }
                      }
                    }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (item.dropdownItems) {
                          setActiveDropdown(activeDropdown === item.title ? null : item.title);
                        }
                      }}
                      className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium 
                        text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 
                        transition-colors"
                    >
                      <motion.span
                        className="mr-3"
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.span>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.dropdownItems && (
                        <motion.span
                          animate={{ rotate: activeDropdown === item.title ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <HiOutlineChevronDown className="w-5 h-5" />
                        </motion.span>
                      )}
                    </motion.button>

                    {/* Mobile Dropdown */}
                    {item.dropdownItems && (
                      <AnimatePresence>
                        {activeDropdown === item.title && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ 
                              opacity: 1, 
                              height: "auto",
                              transition: {
                                height: { type: "spring", stiffness: 400, damping: 30 },
                                opacity: { duration: 0.2 }
                              }
                            }}
                            exit={{ 
                              opacity: 0, 
                              height: 0,
                              transition: {
                                height: { type: "spring", stiffness: 400, damping: 30 },
                                opacity: { duration: 0.2 }
                              }
                            }}
                            className="mt-2 ml-6 space-y-1"
                          >
                            {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                              <motion.div
                                key={dropdownItem.href}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ 
                                  x: 0, 
                                  opacity: 1,
                                  transition: {
                                    delay: dropdownIndex * 0.1,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 24
                                  }
                                }}
                                exit={{ x: -20, opacity: 0 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Link
                                  href={dropdownItem.href}
                                  className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 
                                    dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => setIsOpen(false)}
                                >
                                  <motion.span
                                    className="mr-3"
                                    whileHover={{ rotate: 360, scale: 1.2 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    {dropdownItem.icon}
                                  </motion.span>
                                  <span>{dropdownItem.title}</span>
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                ))}

                <motion.div 
                  className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: 0.2,
                        type: "spring",
                        stiffness: 300,
                        damping: 24
                      }
                    }
                  }}
                >
                  <div className="flex items-center justify-between px-3">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9, rotate: 360 }}
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                        dark:hover:bg-gray-800 transition-colors"
                    >
                      <motion.div
                        animate={{
                          rotate: theme === 'dark' ? 0 : 180,
                        }}
                        transition={{ duration: 0.6, type: "spring" }}
                      >
                        {theme === 'dark' ? (
                          <HiOutlineSun className="w-5 h-5" />
                        ) : (
                          <HiOutlineMoon className="w-5 h-5" />
                        )}
                      </motion.div>
                    </motion.button>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/login"
                        className="relative inline-flex items-center px-6 py-2 rounded-lg overflow-hidden group"
                        onClick={() => setIsOpen(false)}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500"
                          animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        />
                        <motion.span 
                          className="relative flex items-center text-white"
                          whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <motion.span
                            className="mr-2"
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          >
                            <HiOutlineUser className="w-5 h-5" />
                          </motion.span>
                          <span>Login</span>
                        </motion.span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: {
                duration: 0.3
              }
            }}
            exit={{ 
              opacity: 0,
              transition: {
                duration: 0.3
              }
            }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar; 
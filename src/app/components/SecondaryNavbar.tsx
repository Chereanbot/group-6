"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  HiOfficeBuilding,
  HiUserGroup,
  HiAcademicCap,
  HiChartBar,
  HiChevronDown,
  HiClipboardList,
  HiClock,
  HiCube,
  HiDatabase,
  HiGlobe,
  HiLightBulb,
  HiNewspaper,
  HiPresentationChartLine,
  HiTemplate,
  HiUsers
} from 'react-icons/hi';

const SecondaryNavbar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    {
      title: 'About Organization',
      icon: <HiOfficeBuilding className="w-5 h-5" />,
      submenu: [
        { title: 'Overview', href: '/about/overview', icon: <HiPresentationChartLine className="w-5 h-5" /> },
        { title: 'Mission & Vision', href: '/about/mission', icon: <HiLightBulb className="w-5 h-5" /> },
        { title: 'Team', href: '/about/team', icon: <HiUsers className="w-5 h-5" /> },
        { title: 'History', href: '/about/history', icon: <HiClipboardList className="w-5 h-5" /> }
      ],
    },
    {
      title: 'Academic Affairs',
      icon: <HiAcademicCap className="w-5 h-5" />,
      submenu: [
        { title: 'Departments', href: '/academic/departments', icon: <HiCube className="w-5 h-5" /> },
        { title: 'Research', href: '/academic/research', icon: <HiDatabase className="w-5 h-5" /> },
        { title: 'Publications', href: '/academic/publications', icon: <HiNewspaper className="w-5 h-5" /> },
        { title: 'Schedule', href: '/academic/schedule', icon: <HiClock className="w-5 h-5" /> }
      ],
    },
    {
      title: 'Administration',
      icon: <HiChartBar className="w-5 h-5" />,
      submenu: [
        { title: 'Leadership', href: '/admin/leadership', icon: <HiUserGroup className="w-5 h-5" /> },
        { title: 'Policies', href: '/admin/policies', icon: <HiTemplate className="w-5 h-5" /> },
        { title: 'International', href: '/admin/international', icon: <HiGlobe className="w-5 h-5" /> }
      ],
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
      }}
      className={`sticky top-20 z-40 border-b transition-all duration-300
        dark:border-gray-800 ${isScrolled ? 'shadow-md' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-14">
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.title)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="flex items-center space-x-1 px-3 py-1 text-sm font-medium 
                    text-gray-700 dark:text-gray-200 hover:text-primary-600 
                    dark:hover:text-primary-400 transition-colors relative group"
                >
                  <span className="relative z-10 flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </span>
                  <motion.div
                    animate={{ rotate: activeDropdown === item.title ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiChevronDown className="w-4 h-4" />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary-500 w-0 group-hover:w-full 
                      transition-all duration-300"
                    whileHover={{ width: '100%' }}
                  />
                </motion.button>

                <AnimatePresence>
                  {activeDropdown === item.title && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 w-72 rounded-xl shadow-lg 
                        bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 
                        overflow-hidden z-50"
                      style={{ transformOrigin: 'top' }}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white 
                          dark:from-gray-800 dark:to-gray-900 z-0"
                      />
                      <div className="relative grid gap-1 p-2 z-10">
                        {item.submenu.map((subItem, subIndex) => (
                          <Link key={subItem.title} href={subItem.href}>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.1 }}
                              whileHover={{ 
                                x: 4,
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              }}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg
                                text-gray-700 dark:text-gray-200 hover:text-primary-600
                                dark:hover:text-primary-400 transition-all duration-200
                                relative group"
                            >
                              <motion.div
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center 
                                  rounded-lg bg-primary-50 dark:bg-primary-900/30 
                                  text-primary-600 dark:text-primary-400
                                  group-hover:scale-110 transition-transform duration-200"
                              >
                                {subItem.icon}
                              </motion.div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{subItem.title}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {`Explore ${subItem.title.toLowerCase()}`}
                                </span>
                              </div>
                              <motion.div
                                className="absolute right-2 opacity-0 group-hover:opacity-100
                                  transition-opacity duration-200"
                                initial={{ scale: 0.5 }}
                                whileHover={{ scale: 1 }}
                              >
                                →
                              </motion.div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecondaryNavbar;

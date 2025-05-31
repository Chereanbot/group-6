"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlineScale,
  HiOutlineDocumentText,
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
  HiOutlineSupport,
  HiOutlineTranslate
} from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState('home');
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { locale, setLocale, t } = useLanguage();

  // Navigation items with translations
  const getTranslatedNavItems = () => [
    { 
      title: 'Home', 
      translatedTitle: t('navigation.home', 'Home'),
      href: '/', 
      icon: <HiOutlineHome className="w-5 h-5" /> 
    },
    { 
      title: 'About', 
      translatedTitle: t('navigation.about', 'About'),
      href: '/about', 
      icon: <HiOutlineInformationCircle className="w-5 h-5" />,
      dropdownItems: [
        { 
          title: 'Our Mission', 
          translatedTitle: t('navigation.ourMission', 'Our Mission'),
          href: '/about#mission', 
          icon: <HiOutlineLightBulb className="w-5 h-5" /> 
        },
        { 
          title: 'Our Team', 
          translatedTitle: t('navigation.ourTeam', 'Our Team'),
          href: '/about#team', 
          icon: <HiOutlineUserGroup className="w-5 h-5" /> 
        },
        { 
          title: 'History', 
          translatedTitle: t('navigation.history', 'History'),
          href: '/about#history', 
          icon: <HiOutlineAcademicCap className="w-5 h-5" /> 
        },
        { 
          title: 'Partners', 
          translatedTitle: t('navigation.partners', 'Partners'),
          href: '/about#partners', 
          icon: <HiOutlineGlobe className="w-5 h-5" /> 
        }
      ]
    },
    { 
      title: 'Services', 
      translatedTitle: t('navigation.services', 'Services'),
      href: '/services', 
      icon: <HiOutlineScale className="w-5 h-5" />,
      dropdownItems: [
        { 
          title: 'Legal Consultation', 
          translatedTitle: t('navigation.legalConsultation', 'Legal Consultation'),
          href: '/services/consultation', 
          icon: <HiOutlineChatAlt2 className="w-5 h-5" /> 
        },
        { 
          title: 'Document Review', 
          translatedTitle: t('navigation.documentReview', 'Document Review'),
          href: '/services/document-review', 
          icon: <HiOutlineClipboardList className="w-5 h-5" /> 
        },
        { 
          title: 'Court Representation', 
          translatedTitle: t('navigation.courtRepresentation', 'Court Representation'),
          href: '/services/court-representation', 
          icon: <HiOutlineBriefcase className="w-5 h-5" /> 
        },
        { 
          title: 'Legal Support', 
          translatedTitle: t('navigation.legalSupport', 'Legal Support'),
          href: '/services/legal-support', 
          icon: <HiOutlineSupport className="w-5 h-5" /> 
        }
      ]
    },
    { 
      title: 'Resources', 
      translatedTitle: t('navigation.resources', 'Resources'),
      href: '/resources', 
      icon: <HiOutlineCollection className="w-5 h-5" />,
      dropdownItems: [
        { 
          title: 'Documents', 
          translatedTitle: t('navigation.documents', 'Documents'),
          href: '/documents', 
          icon: <HiOutlineDocumentText className="w-5 h-5" /> 
        },
        { 
          title: 'Rules & Regulations', 
          translatedTitle: t('navigation.rulesRegulations', 'Rules & Regulations'),
          href: '/rules', 
          icon: <HiOutlineShieldCheck className="w-5 h-5" /> 
        },
        { 
          title: 'Settings', 
          translatedTitle: t('navigation.settings', 'Settings'),
          href: '/settings', 
          icon: <HiOutlineCog className="w-5 h-5" /> 
        }
      ]
    },
    { 
      title: 'Contact', 
      translatedTitle: t('navigation.contact', 'Contact'),
      href: '/contact', 
      icon: <HiOutlinePhone className="w-5 h-5" /> 
    }
  ];
  
  const navItems = getTranslatedNavItems();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Set active mobile tab based on current path
  useEffect(() => {
    if (pathname === '/') {
      setActiveMobileTab('home');
    } else if (pathname.includes('/about')) {
      setActiveMobileTab('about');
    } else if (pathname.includes('/services')) {
      setActiveMobileTab('services');
    } else if (pathname.includes('/resources')) {
      setActiveMobileTab('resources');
    } else if (pathname.includes('/contact')) {
      setActiveMobileTab('contact');
    }
  }, [pathname]);

  const handleDropdownEnter = (title: string) => {
    setActiveDropdown(title);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'am' : 'en');
    setShowLanguageMenu(false);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900 shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-[#00572d] to-[#1f9345] rounded-lg flex items-center justify-center mr-2 shadow-md">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#00572d] to-[#1f9345] text-transparent bg-clip-text">DULAS</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {navItems.map((item) => (
                <div 
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.dropdownItems && handleDropdownEnter(item.title)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                      pathname === item.href 
                        ? 'text-[#00572d] dark:text-[#1f9345] font-semibold' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-[#00572d] dark:hover:text-[#1f9345] hover:bg-[#00572d]/10 dark:hover:bg-[#00572d]/20'
                    }`}
                  >
                    <span className={`mr-2 ${pathname === item.href ? 'text-[#00572d] dark:text-[#1f9345]' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span>{item.translatedTitle}</span>
                    {item.dropdownItems && (
                      <HiOutlineChevronDown className={`ml-1 w-4 h-4 transition-transform ${
                        activeDropdown === item.title ? 'rotate-180' : 'rotate-0'
                      }`} />
                    )}
                  </Link>
                  
                  {/* Dropdown for desktop */}
                  {item.dropdownItems && (
                    <AnimatePresence>
                      {activeDropdown === item.title && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 mt-1 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-50"
                        >
                          <div className="py-2">
                            {item.dropdownItems.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#00572d]/10 dark:hover:bg-[#00572d]/20 hover:text-[#00572d] dark:hover:text-[#1f9345]"
                              >
                                <span className="mr-2 text-[#00572d] dark:text-[#1f9345]">
                                  {dropdownItem.icon}
                                </span>
                                <span>{dropdownItem.translatedTitle}</span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}

              {/* Theme Toggle & Language & Login Button */}
              <div className="flex items-center ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full bg-[#00572d]/10 dark:bg-[#00572d]/20 text-[#00572d] dark:text-[#1f9345] mr-2"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <HiOutlineSun className="w-5 h-5" />
                  ) : (
                    <HiOutlineMoon className="w-5 h-5" />
                  )}
                </button>
                
                {/* Language Selector */}
                <div className="relative mr-2">
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="p-2 rounded-full bg-[#00572d]/10 dark:bg-[#00572d]/20 text-[#00572d] dark:text-[#1f9345] flex items-center"
                    aria-label="Change language"
                  >
                    <HiOutlineTranslate className="w-5 h-5" />
                    <span className="ml-1 text-xs font-medium">{locale.toUpperCase()}</span>
                  </button>
                  
                  <AnimatePresence>
                    {showLanguageMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-1 w-32 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-50"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => { setLocale('en'); setShowLanguageMenu(false); }}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              locale === 'en' 
                                ? 'bg-[#00572d]/10 dark:bg-[#00572d]/20 text-[#00572d] dark:text-[#1f9345] font-medium' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-[#00572d]/10 dark:hover:bg-[#00572d]/20'
                            }`}
                          >
                            English
                          </button>
                          <button
                            onClick={() => { setLocale('am'); setShowLanguageMenu(false); }}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              locale === 'am' 
                                ? 'bg-[#00572d]/10 dark:bg-[#00572d]/20 text-[#00572d] dark:text-[#1f9345] font-medium' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-[#00572d]/10 dark:hover:bg-[#00572d]/20'
                            }`}
                          >
                            አማርኛ
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Login Button */}
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#00572d] to-[#1f9345] hover:from-[#1f9345] hover:to-[#00572d] text-white shadow-md transition-colors"
                >
                  <HiOutlineUser className="w-5 h-5 mr-1" />
                  <span>{t('navigation.login', 'Login')}</span>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-[#00572d]/10 dark:bg-[#00572d]/20 text-[#00572d] dark:text-[#1f9345] mr-2"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <HiOutlineSun className="w-5 h-5" />
                ) : (
                  <HiOutlineMoon className="w-5 h-5" />
                )}
              </button>
              
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-full bg-[#00572d]/10 dark:bg-[#00572d]/20 text-[#00572d] dark:text-[#1f9345] mr-2 flex items-center"
                aria-label="Toggle language"
              >
                <HiOutlineTranslate className="w-5 h-5" />
                <span className="ml-1 text-xs font-medium">{locale.toUpperCase()}</span>
              </button>
              
              {/* Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-[#00572d]/10 dark:hover:bg-[#00572d]/20"
                aria-label="Open menu"
              >
                {isOpen ? (
                  <HiOutlineX className="w-6 h-6" />
                ) : (
                  <HiOutlineMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="px-4 py-2 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems.map((item) => (
                  <div key={item.href} className="py-1">
                    <button
                      onClick={() => {
                        if (item.dropdownItems) {
                          setActiveDropdown(activeDropdown === item.title ? null : item.title);
                        } else {
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left ${
                        pathname === item.href 
                          ? 'text-[#00572d] dark:text-[#1f9345] bg-[#00572d]/10 dark:bg-[#00572d]/20 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-[#00572d] dark:text-[#1f9345]">{item.icon}</span>
                        <span>{item.translatedTitle}</span>
                      </div>
                      {item.dropdownItems && (
                        <HiOutlineChevronDown className={`w-5 h-5 transition-transform ${
                          activeDropdown === item.title ? 'rotate-180' : 'rotate-0'
                        }`} />
                      )}
                    </button>
                    
                    {/* Mobile Dropdown */}
                    {item.dropdownItems && (
                      <AnimatePresence>
                        {activeDropdown === item.title && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 ml-4 space-y-1"
                          >
                            {item.dropdownItems.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-[#00572d]/10 dark:hover:bg-[#00572d]/20 hover:text-[#00572d] dark:hover:text-[#1f9345]"
                                onClick={() => setIsOpen(false)}
                              >
                                <span className="mr-3 text-[#00572d] dark:text-[#1f9345]">
                                  {dropdownItem.icon}
                                </span>
                                <span>{dropdownItem.translatedTitle}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-800">
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#00572d] to-[#1f9345] hover:from-[#1f9345] hover:to-[#00572d] text-white shadow-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <HiOutlineUser className="w-5 h-5 mr-2" />
                    <span>{t('navigation.login', 'Login')}</span>
                  </Link>
                </div>
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                activeMobileTab === item.title.toLowerCase() 
                  ? 'text-[#00572d] dark:text-[#1f9345]' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveMobileTab(item.title.toLowerCase())}
            >
              <div className={`p-1 rounded-full ${
                activeMobileTab === item.title.toLowerCase() 
                  ? 'bg-[#00572d]/10 dark:bg-[#00572d]/20' 
                  : ''
              }`}>
                {item.icon}
              </div>
              <span className="text-xs mt-1">
                {item.translatedTitle}
              </span>
              {activeMobileTab === item.title.toLowerCase() && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 w-12 h-1 bg-[#00572d] dark:bg-[#1f9345] rounded-t-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;

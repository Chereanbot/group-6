"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '@/utils/toast';
import { 
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineCheck,
  HiOutlineExclamation
} from 'react-icons/hi';

interface LoginForm {
  identifier: string;
  password: string;
}

interface ValidationErrors {
  identifier?: string;
  password?: string;
}

const roleIcons = {
  SUPER_ADMIN: <HiOutlineUserGroup className="w-6 h-6" />,
  ADMIN: <HiOutlineAcademicCap className="w-6 h-6" />,
  LAWYER: <HiOutlineScale className="w-6 h-6" />,
  COORDINATOR: <HiOutlineBriefcase className="w-6 h-6" />,
  CLIENT: <HiOutlineUser className="w-6 h-6" />
};

function getRoleBasedRedirect(userRole: string) {
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin/dashboard';
    case 'LAWYER':
      return '/lawyer/dashboard';
    case 'COORDINATOR':
      return '/coordinator/dashboard';
    case 'CLIENT':
      return '/client/welcome';
    default:
      return '/';
  }
}

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [formData, setFormData] = useState<LoginForm>({
    identifier: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const translations = {
    en: {
      welcome: 'Welcome Back',
      subtitle: 'Sign in to Dilla University Legal Aid Service',
      emailLabel: 'Email, Phone or Username',
      passwordLabel: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      register: 'Register now',
      secure: 'Your connection is secure'
    },
    am: {
      welcome: 'እንኳን ደህና መጡ',
      subtitle: 'ወደ ዲላ ዩኒቨርሲቲ የሕግ ድጋፍ አገልግሎት ይግቡ',
      emailLabel: 'ኢሜይል፣ ስልክ ወይም የተጠቃሚ ስም',
      passwordLabel: 'የይለፍ ቃል',
      rememberMe: 'አስታውሰኝ',
      forgotPassword: 'የይለፍ ቃል ረሳህ?',
      signIn: 'ግባ',
      noAccount: 'አካውንት የለህም?',
      register: 'አሁን ተመዝገብ',
      secure: 'ግንኙነትዎ ደህንነቱ የተጠበቀ ነው'
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.identifier) {
      errors.identifier = 'Email, phone, or username is required';
    } else {
      // Check if it's a valid email, phone, or username
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
      const isPhone = /^\+?[0-9]{10,15}$/.test(formData.identifier);
      const isUsername = formData.identifier.length >= 3;
      
      if (!isEmail && !isPhone && !isUsername) {
        errors.identifier = 'Please enter a valid email, phone number, or username';
      }
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please correct the form errors', 'error');
      return;
    }

    setIsLoading(true);
    setLoginAttempts(prev => prev + 1);

    try {
      // Determine login method (for UI feedback)
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
      const isPhone = /^\+?[0-9]{10,15}$/.test(formData.identifier);
      const loginMethod = isEmail ? 'email' : (isPhone ? 'phone' : 'username');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password
        })
      });

      const data = await response.json();

      // Check if the response contains a success flag
      if (response.ok && data.success) {
        if (!data.token) {
          throw new Error('No token received from server');
        }
        
        showToast('Login successful!', 'success');
        localStorage.setItem('token', data.token);
        document.cookie = `auth-token=${data.token}; path=/;`;
        
        // Animated success feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if user data exists and has a userRole
        if (data.user && data.user.userRole) {
          const callbackUrl = getRoleBasedRedirect(data.user.userRole);
          router.push(callbackUrl);
        } else {
          // Default to client dashboard if role is missing
          console.warn('User role not found in response, using default redirect');
          router.push('/client/dashboard');
        }
      } else {
        // Handle unsuccessful login with more detailed error messages
        throw new Error(data.message || data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on the error
      if (error.message.includes('No token received')) {
        showToast('Authentication error: No token received from server', 'error');
      } else if (error.message.includes('Invalid JWT format')) {
        showToast('Authentication error: Invalid token format', 'error');
      } else if (error.message.includes('Server selection timeout')) {
        showToast('Database connection error. Please try again later.', 'error');
      } else {
        showToast(error.message || 'Login failed. Please try again.', 'error');
      }
      
      if (loginAttempts >= 3) {
        showToast('Too many failed attempts. Please try again later or reset your password.', 'warning');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Background animation variants
  const backgroundVariants = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  };

  // Form field animation variants
  const formFieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Enhanced Animated Background */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        variants={backgroundVariants}
        animate="animate"
      >
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.02] bg-repeat bg-center" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
          }}
        />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {isMounted && [...Array(20)].map((_, i) => {
            const randomX1 = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
            const randomX2 = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
            const randomY1 = Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000);
            const randomY2 = Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000);
            const randomDuration = Math.random() * 10 + 10;
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary-500/20 rounded-full"
                animate={{
                  x: [randomX1, randomX2],
                  y: [randomY1, randomY2],
                  scale: [0.5, 1, 0.5],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: randomDuration,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            );
          })}
        </div>
      </motion.div>

      <div className="max-w-md w-full mx-auto">
        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl relative overflow-hidden"
        >
          {/* Language Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLanguage(lang => lang === 'en' ? 'am' : 'en')}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700
              hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <HiOutlineGlobe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>

          {/* Logo and Title */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <img
                src="/images/logo.png"
                alt="Dilla University Legal Aid Service"
                className="h-24 w-auto"
              />
              <motion.div
                className="absolute -inset-2 bg-primary-500/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            </div>
            
            <motion.h2
              className="mt-6 text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400
                bg-clip-text text-transparent"
            >
              {translations[language].welcome}
            </motion.h2>
            <motion.p className="mt-2 text-gray-600 dark:text-gray-400">
              {translations[language].subtitle}
            </motion.p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial="hidden"
            animate="visible"
          >
            {/* Email/Phone Field */}
            <motion.div
              variants={formFieldVariants}
              custom={0}
              className="space-y-1"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translations[language].emailLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <HiOutlineMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => {
                    setFormData({ ...formData, identifier: e.target.value });
                    setValidationErrors({ ...validationErrors, identifier: undefined });
                  }}
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                    validationErrors.identifier
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-colors`}
                  placeholder={translations[language].emailLabel}
                />
                <AnimatePresence>
                  {validationErrors.identifier && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {validationErrors.identifier}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              variants={formFieldVariants}
              custom={1}
              className="space-y-1"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translations[language].passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setValidationErrors({ ...validationErrors, password: undefined });
                  }}
                  className={`block w-full pl-10 pr-10 py-2 rounded-lg border ${
                    validationErrors.password
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-colors`}
                  placeholder={translations[language].passwordLabel}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <motion.span
                    animate={{ scale: showPassword ? 1 : 0.8 }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </motion.span>
                </button>
                <AnimatePresence>
                  {validationErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {validationErrors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Remember Me and Forgot Password */}
            <motion.div
              variants={formFieldVariants}
              custom={2}
              className="flex items-center justify-between"
            >
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600
                    focus:ring-primary-500 transition-colors"
                />
                <span className="text-gray-600 dark:text-gray-400">
                  {translations[language].rememberMe}
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500
                  dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                {translations[language].forgotPassword}
              </Link>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              variants={formFieldVariants}
              custom={3}
              className="flex items-center justify-center p-4 bg-primary-50
                dark:bg-primary-900/20 rounded-lg space-x-2"
            >
              <HiOutlineShieldCheck className="w-5 h-5 text-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {translations[language].secure}
              </span>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={formFieldVariants}
              custom={4}
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-3 px-4 border border-transparent
                rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-500
                hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-primary-500 font-medium transition-all
                disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent
                  via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear',
                }}
              />
              
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <span className="flex items-center space-x-2">
                  <HiOutlineArrowRight className="w-5 h-5" />
                  <span>{translations[language].signIn}</span>
                </span>
              )}
            </motion.button>

            {/* Register Link */}
            <motion.p
              variants={formFieldVariants}
              custom={5}
              className="text-center text-sm text-gray-600 dark:text-gray-400"
            >
              {translations[language].noAccount}{' '}
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:text-primary-500
                  dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                {translations[language].register}
              </Link>
            </motion.p>
          </motion.form>

          {/* Decorative Elements */}
          <motion.div
            className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24
              bg-gradient-to-br from-primary-500/30 to-transparent rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24
              bg-gradient-to-tr from-primary-500/30 to-transparent rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 2,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
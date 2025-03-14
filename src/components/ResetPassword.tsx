"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '@/utils/toast';
import { 
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheck,
  HiOutlineX
} from 'react-icons/hi';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  password?: string;
  confirmPassword?: string;
}

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState<ResetForm>({
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');

  const translations = {
    en: {
      title: 'Reset Your Password',
      subtitle: 'Enter your new password below',
      passwordLabel: 'New Password',
      confirmPasswordLabel: 'Confirm Password',
      resetButton: 'Reset Password',
      backToLogin: 'Back to Login',
      secure: 'Your connection is secure',
      passwordRequirements: 'Password must:',
      minLength: 'Be at least 8 characters',
      hasNumber: 'Include a number',
      hasSpecial: 'Include a special character',
      hasUpper: 'Include an uppercase letter',
      hasLower: 'Include a lowercase letter',
      passwordsMatch: 'Passwords must match'
    },
    am: {
      title: 'የይለፍ ቃልዎን ያድሱ',
      subtitle: 'አዲስ የይለፍ ቃልዎን ያስገቡ',
      passwordLabel: 'አዲስ የይለፍ ቃል',
      confirmPasswordLabel: 'የይለፍ ቃል ያረጋግጡ',
      resetButton: 'የይለፍ ቃል ያድሱ',
      backToLogin: 'ወደ መግቢያ ይመለሱ',
      secure: 'ግንኙነትዎ ደህንነቱ የተጠበቀ ነው',
      passwordRequirements: 'የይለፍ ቃል መስፈርቶች:',
      minLength: 'ቢያንስ 8 ቁምፊዎች',
      hasNumber: 'ቁጥር ያካተተ',
      hasSpecial: 'ልዩ ቁምፊ ያካተተ',
      hasUpper: 'ከፍተኛ ፊደል ያካተተ',
      hasLower: 'ዝቅተኛ ፊደል ያካተተ',
      passwordsMatch: 'የይለፍ ቃሎች መመሳሰል አለባቸው'
    }
  };

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);

    return hasMinLength && hasNumber && hasSpecial && hasUpper && hasLower;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!validatePassword(formData.password)) {
      errors.password = 'Password does not meet requirements';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = translations[language].passwordsMatch;
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!token) {
      showToast('Invalid reset token', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password reset successful!', 'success');
        
        // Animated success feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/login');
      } else {
        throw new Error(data.error || 'Password reset failed');
      }
    } catch (error: any) {
      console.error('Reset error:', error);
      showToast(error.message || 'Password reset failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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

  const checkRequirement = (requirement: (password: string) => boolean) => {
    const meets = requirement(formData.password);
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center space-x-1 ${
          meets ? 'text-green-500' : 'text-gray-400'
        }`}
      >
        {meets ? (
          <HiOutlineCheck className="w-4 h-4" />
        ) : (
          <HiOutlineX className="w-4 h-4" />
        )}
      </motion.span>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Animated Background */}
      <motion.div className="absolute inset-0 overflow-hidden">
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
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-500/20 rounded-full"
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight
                ],
                scale: [0.5, 1, 0.5],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          ))}
        </div>
      </motion.div>

      <div className="max-w-md w-full mx-auto">
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
              {translations[language].title}
            </motion.h2>
            <motion.p className="mt-2 text-gray-600 dark:text-gray-400">
              {translations[language].subtitle}
            </motion.p>
          </motion.div>

          {/* Reset Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial="hidden"
            animate="visible"
          >
            {/* Password Field */}
            <motion.div
              variants={formFieldVariants}
              custom={0}
              className="space-y-1"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translations[language].passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`block w-full px-4 py-3 rounded-lg border
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-colors ${
                      validationErrors.password
                        ? 'border-red-300 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                    hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                >
                  {validationErrors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              variants={formFieldVariants}
              custom={1}
              className="space-y-1"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translations[language].confirmPasswordLabel}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`block w-full px-4 py-3 rounded-lg border
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-colors ${
                      validationErrors.confirmPassword
                        ? 'border-red-300 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                    hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                >
                  {validationErrors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            {/* Password Requirements */}
            <motion.div
              variants={formFieldVariants}
              custom={2}
              className="space-y-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <p className="font-medium">{translations[language].passwordRequirements}</p>
              <ul className="space-y-1">
                <li className="flex items-center space-x-2">
                  {checkRequirement((p) => p.length >= 8)}
                  <span>{translations[language].minLength}</span>
                </li>
                <li className="flex items-center space-x-2">
                  {checkRequirement((p) => /\d/.test(p))}
                  <span>{translations[language].hasNumber}</span>
                </li>
                <li className="flex items-center space-x-2">
                  {checkRequirement((p) => /[!@#$%^&*(),.?":{}|<>]/.test(p))}
                  <span>{translations[language].hasSpecial}</span>
                </li>
                <li className="flex items-center space-x-2">
                  {checkRequirement((p) => /[A-Z]/.test(p))}
                  <span>{translations[language].hasUpper}</span>
                </li>
                <li className="flex items-center space-x-2">
                  {checkRequirement((p) => /[a-z]/.test(p))}
                  <span>{translations[language].hasLower}</span>
                </li>
              </ul>
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
                  <HiOutlineLockClosed className="w-5 h-5" />
                  <span>{translations[language].resetButton}</span>
                </span>
              )}
            </motion.button>

            {/* Back to Login Link */}
            <motion.div
              variants={formFieldVariants}
              custom={5}
              className="text-center"
            >
              <Link
                href="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-500
                  dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                {translations[language].backToLogin}
              </Link>
            </motion.div>
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

export default ResetPassword; 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '@/utils/toast';
import { 
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineKey,
  HiOutlineArrowRight,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineRefresh
} from 'react-icons/hi';

interface VerifyForm {
  otp: string[];
}

const VerifyOTP = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<VerifyForm>({
    otp: Array(6).fill('')
  });
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [verifyType, setVerifyType] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const translations = {
    en: {
      title: 'Verify Your Account',
      subtitle: 'Enter the verification code sent to your',
      otpLabel: 'Verification Code',
      verifyButton: 'Verify Account',
      resendButton: 'Resend Code',
      backToLogin: 'Back to Login',
      secure: 'Your connection is secure',
      timeRemaining: 'Time remaining',
      seconds: 'seconds',
      email: 'email',
      phone: 'phone'
    },
    am: {
      title: 'መለያዎን ያረጋግጡ',
      subtitle: 'የተላከውን የማረጋገጫ ኮድ ያስገቡ',
      otpLabel: 'የማረጋገጫ ኮድ',
      verifyButton: 'መለያ ያረጋግጡ',
      resendButton: 'ኮድ እንደገና ይላኩ',
      backToLogin: 'ወደ መግቢያ ይመለሱ',
      secure: 'ግንኙነትዎ ደህንነቱ የተጠበቀ ነው',
      timeRemaining: 'የቀረው ጊዜ',
      seconds: 'ሰከንዶች',
      email: 'ኢሜይል',
      phone: 'ስልክ'
    }
  };

  useEffect(() => {
    const userId = window.sessionStorage.getItem('userId');
    const type = window.sessionStorage.getItem('verifyType') as 'EMAIL' | 'PHONE';
    
    if (!userId) {
      router.push('/login');
      return;
    }

    if (type) {
      setVerifyType(type);
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOTP = [...formData.otp];
    newOTP[index] = value;
    setFormData({ otp: newOTP });

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otp = formData.otp.join('');
    if (otp.length !== 6) {
      showToast('Please enter the complete verification code', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const userId = window.sessionStorage.getItem('userId');
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          otp,
          type: verifyType
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Verification successful!', 'success');
        window.sessionStorage.removeItem('userId');
        window.sessionStorage.removeItem('verifyType');
        
        // Animated success feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/login');
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      showToast(error.message || 'Verification failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      const userId = window.sessionStorage.getItem('userId');
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: verifyType
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Verification code resent successfully', 'success');
        setTimeLeft(60);
        setCanResend(false);
      } else {
        throw new Error(data.error || 'Failed to resend code');
      }
    } catch (error: any) {
      console.error('Resend code error:', error);
      showToast(error.message || 'Failed to resend code. Please try again.', 'error');
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
              {translations[language].subtitle}{' '}
              {verifyType === 'EMAIL' ? translations[language].email : translations[language].phone}
            </motion.p>
          </motion.div>

          {/* Verify Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial="hidden"
            animate="visible"
          >
            {/* OTP Input Fields */}
            <motion.div
              variants={formFieldVariants}
              custom={0}
              className="space-y-1"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translations[language].otpLabel}
              </label>
              <div className="flex justify-between gap-2">
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-semibold rounded-lg border
                      border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                      text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500
                      focus:border-transparent transition-colors"
                  />
                ))}
              </div>
            </motion.div>

            {/* Timer */}
            <motion.div
              variants={formFieldVariants}
              custom={1}
              className="text-center text-sm text-gray-600 dark:text-gray-400"
            >
              {!canResend && (
                <span>
                  {translations[language].timeRemaining}: {timeLeft} {translations[language].seconds}
                </span>
              )}
            </motion.div>

            {/* Security Notice */}
            <motion.div
              variants={formFieldVariants}
              custom={2}
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
              custom={3}
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
                  <HiOutlineKey className="w-5 h-5" />
                  <span>{translations[language].verifyButton}</span>
                </span>
              )}
            </motion.button>

            {/* Resend Button */}
            <motion.button
              variants={formFieldVariants}
              custom={4}
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isLoading}
              className="relative w-full flex justify-center py-2 px-4 border border-primary-600
                rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center space-x-2">
                <HiOutlineRefresh className="w-5 h-5" />
                <span>{translations[language].resendButton}</span>
              </span>
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

export default VerifyOTP; 
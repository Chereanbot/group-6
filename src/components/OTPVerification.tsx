"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast, hideToast } from '@/utils/toast';
import { useLanguage } from '@/providers/LanguageProvider';
import { 
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineMail,
  HiOutlineDeviceMobile,
  HiOutlineLockClosed,
  HiOutlineExclamation
} from 'react-icons/hi';

const OTPVerification = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes (180 seconds)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyType, setVerifyType] = useState<string>('');

  useEffect(() => {
    const userId = window.sessionStorage.getItem('userId');
    const type = window.sessionStorage.getItem('verifyType') || 'PHONE'; // Default to PHONE

    if (!userId) {
      showToast(t('otp.error.restart', 'Please start the verification process again'), 'error');
      router.push('/login');
      return;
    }

    // Always set to PHONE for direct physical phone verification
    setVerifyType('PHONE');
    
    // Save the type to session storage if it's not already set
    if (!window.sessionStorage.getItem('verifyType')) {
      window.sessionStorage.setItem('verifyType', 'PHONE');
    }

    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, router, t]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && element.nextElementSibling) {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const inputs = e.currentTarget.parentElement?.getElementsByTagName('input');
      if (inputs && inputs[index - 1]) {
        inputs[index - 1].focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((value, index) => {
      if (index < 6) newOtp[index] = value;
    });
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError(t('otp.error.incomplete', 'Please enter all 6 digits'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const loadingToast = showToast(t('otp.verifying', 'Verifying OTP...'), 'loading');

      const userId = window.sessionStorage.getItem('userId');
      // Always use PHONE type for verification
      const type = 'PHONE';

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp: otpString,
          type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('otp.error.verification', 'Verification failed'));
      }

      hideToast(loadingToast);
      showToast(t('otp.success', 'Phone number verified successfully!'), 'success');
      
      window.sessionStorage.removeItem('userId');
      window.sessionStorage.removeItem('verifyType');
      
      // After phone verification, redirect to the appropriate page
      // For new registrations, go to the next registration step
      // For password reset, go to reset-password
      const redirectPath = window.sessionStorage.getItem('otpRedirectPath') || '/login';
      window.sessionStorage.removeItem('otpRedirectPath');
      router.push(redirectPath);

    } catch (error: any) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      const loadingToast = showToast(t('otp.sending', 'Sending OTP to your phone...'), 'loading');

      const userId = window.sessionStorage.getItem('userId');
      // Always use PHONE type for OTP
      const type = 'PHONE';
      
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('otp.error.resend', 'Failed to send OTP to your phone'));
      }

      hideToast(loadingToast);
      showToast(t('otp.resent', 'Verification code sent to your phone'), 'success');
      
      // Reset the timer to 3 minutes
      setTimeLeft(180);
    } catch (error: any) {
      showToast(error.message || t('otp.error.resend', 'Failed to send OTP to your phone'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const formFieldVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };

  const otpInputVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3 + (i * 0.05),
        duration: 0.3,
        type: 'spring',
        stiffness: 300
      }
    }),
    focus: { scale: 1.05, borderColor: '#1f9345' },
    blur: { scale: 1, borderColor: '#00572d' }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative Elements */}
          <motion.div
            className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24
              rounded-full blur-xl"
            style={{ background: 'radial-gradient(circle, rgba(31,147,69,0.3) 0%, rgba(0,87,45,0) 70%)' }}
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
              rounded-full blur-xl"
            style={{ background: 'radial-gradient(circle, rgba(243,195,0,0.3) 0%, rgba(0,0,0,0) 70%)' }}
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
          
          <form onSubmit={handleSubmit}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Header */}
              <motion.div variants={formFieldVariants} custom={0} className="text-center">
                <motion.h2 
                  className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
                  style={{ color: '#00572d' }}
                >
                  {t('otp.title', 'Verify OTP')}
                </motion.h2>
                <motion.p 
                  className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2"
                  variants={formFieldVariants}
                  custom={1}
                >
                  {verifyType === 'EMAIL' ? 
                    <HiOutlineMail className="w-5 h-5 text-primary-500" /> : 
                    <HiOutlineDeviceMobile className="w-5 h-5 text-primary-500" />
                  }
                  {t('otp.instruction', 'Enter the verification code sent to your {type}', { type: verifyType.toLowerCase() })}
                </motion.p>
              </motion.div>

              <motion.div 
                className="flex justify-center gap-2 my-8"
                variants={formFieldVariants}
                custom={2}
              >
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    variants={otpInputVariants}
                    custom={index}
                    initial="initial"
                    animate="animate"
                    whileFocus="focus"
                    whileBlur="blur"
                    className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    style={{ 
                      borderColor: '#00572d', 
                      color: '#333333',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </motion.div>

              {error && (
                <motion.div 
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <HiOutlineExclamation className="w-5 h-5 text-red-500" />
                  {error}
                </motion.div>
              )}

              <motion.button
                variants={formFieldVariants}
                custom={3}
                type="submit"
                disabled={isLoading}
                className="relative w-full flex justify-center py-3 px-4 border border-transparent
                  rounded-lg text-white font-medium transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                style={{ backgroundColor: '#1f9345' }}
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
                    <span>{t('otp.verify', 'Verify OTP')}</span>
                  </span>
                )}
              </motion.button>

              <motion.div 
                className="mt-4 text-center"
                variants={formFieldVariants}
                custom={4}
              >
                {timeLeft > 0 ? (
                  <motion.div 
                    className="flex items-center justify-center gap-2 text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="w-5 h-5 rounded-full border-2 border-primary-300"
                      style={{ borderTopColor: '#1f9345' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p>
                      {t('otp.resendCountdown', 'Resend code in {time}', { 
                        time: `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` 
                      })}
                    </p>
                  </motion.div>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-2 mx-auto"
                    style={{ color: '#1f9345' }}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <HiOutlineMail className="w-5 h-5" />
                    {t('otp.resend', 'Resend OTP')}
                  </motion.button>
                )}
              </motion.div>

              <motion.div 
                className="mt-6 text-center"
                variants={formFieldVariants}
                custom={5}
              >
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  style={{ color: '#1f9345' }}
                >
                  <HiOutlineLockClosed className="w-5 h-5" />
                  {t('otp.backToLogin', 'Back to Login')}
                </Link>
              </motion.div>
              
              {/* Security Notice */}
              <motion.div
                variants={formFieldVariants}
                custom={6}
                className="flex items-center justify-center p-4 mt-6 bg-gray-50
                  dark:bg-gray-800/20 rounded-lg space-x-2"
              >
                <HiOutlineShieldCheck className="w-5 h-5 text-primary-500" style={{ color: '#1f9345' }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('otp.secure', 'Your connection is secure')}
                </span>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPVerification;
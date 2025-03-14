"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixBackground from './MatrixBackground';
import { registerUser } from '@/utils/auth';
import { showToast, hideToast } from '@/utils/toast';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineLockClosed, 
  HiOutlineUserCircle, 
  HiOutlineArrowRight, 
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineScale,
  HiOutlineGlobe,
  HiOutlineAcademicCap,
  HiOutlineBriefcase
} from 'react-icons/hi';

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const testimonials = [
    {
      name: "Dr. Cherinet Afewerk",
      role: "Dean, School of Law",
      image: "/images/testimonials/testimonial1.jpg",
      message: "ዲላ ዩኒቨርሲቲ የህግ ድጋፍ አገልግሎት በአካባቢው ማህበረሰብ ውስጥ ፍትህን ለማስፈን እየሰራ ነው። Our legal aid service is working tirelessly to ensure justice in our community.",
      rating: 5
    },
    {
      name: "Amanuel Tizazu",
      role: "Senior Legal Counsel",
      image: "/images/testimonials/testimonial2.jpg",
      message: "እንደ ህግ ባለሙያ፣ ይህ መድረክ የህግ አገልግሎቶችን ለማህበረሰባችን በቀላሉ እንዲደርስ አድርጓል። This platform has made legal services more accessible to our community.",
      rating: 5
    },
    {
      name: "Bisrat Fikre",
      role: "Legal Aid Coordinator",
      image: "/images/testimonials/testimonial3.jpg",
      message: "የህግ ድጋፍ አገልግሎታችን በቀላሉ ለማግኘት እና ለመጠቀም የሚያስችል ነው። Our registration process is user-friendly and the service has been transformative.",
      rating: 5
    }
  ];

  const trustIndicators = [
    {
      icon: <HiOutlineScale className="w-6 h-6" />,
      title: "የሙያ አገልግሎት",
      description: "Expert legal assistance from qualified Ethiopian professionals"
    },
    {
      icon: <HiOutlineShieldCheck className="w-6 h-6" />,
      title: "አስተማማኝ መድረክ",
      description: "Your data is protected with advanced security measures"
    },
    {
      icon: <HiOutlineGlobe className="w-6 h-6" />,
      title: "ሰአት አልባ አገልግሎት",
      description: "Access legal resources and support anytime you need"
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    // Full Name validation
    if (!formData.fullName || formData.fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }
    
    // Username validation
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Phone validation
    const phoneRegex = /^\+?[1-9]\d{9,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const loadingToast = showToast('Creating your account...', 'loading');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      hideToast(loadingToast);
      showToast('Registration successful!', 'success');
      
      // Store userId for OTP verification
      window.sessionStorage.setItem('userId', data.userId);
      window.sessionStorage.setItem('verifyType', 'EMAIL');
      
      router.push('/verify-otp');
      
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  const formFields = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      icon: <HiOutlineUserCircle className="w-5 h-5" />,
      placeholder: 'Enter your full name'
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      icon: <HiOutlineUser className="w-5 h-5" />,
      placeholder: 'Choose a username'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      icon: <HiOutlineMail className="w-5 h-5" />,
      placeholder: 'Enter your email'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      icon: <HiOutlinePhone className="w-5 h-5" />,
      placeholder: 'Enter your phone number'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      icon: <HiOutlineLockClosed className="w-5 h-5" />,
      placeholder: 'Create a password'
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      icon: <HiOutlineLockClosed className="w-5 h-5" />,
      placeholder: 'Confirm your password'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.02] bg-repeat bg-center" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: "radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)"
          }}
        />
      </div>

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Registration Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl relative overflow-hidden"
        >
          {/* Logo and Title Section */}
          <div className="text-center relative mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <img
                  src="/images/logo.png"
                  alt="Dilla University Legal Aid Service"
                  className="h-20 w-auto"
                />
                <motion.div
                  className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
            >
              Create Your Account
            </motion.h2>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-gray-600 dark:text-gray-400"
            >
              Join Dilla University Legal Aid Service
            </motion.p>
          </div>

          {/* Registration Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.map((field, index) => (
                <motion.div
                  key={field.name}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  className="relative"
                >
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                      {field.icon}
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      required
                      value={formData[field.name as keyof FormData]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        transition-all duration-200 group-hover:border-primary-400"
                      placeholder={field.placeholder}
                    />
                    <motion.div
                      className="absolute inset-0 border border-primary-500/0 rounded-lg pointer-events-none"
                      whileHover={{ borderColor: "rgba(59, 130, 246, 0.2)" }}
                    />
                    {errors[field.name as keyof FormData] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors[field.name as keyof FormData]}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
            >
              <HiOutlineShieldCheck className="w-5 h-5 mr-2 text-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Your data is securely encrypted and protected
              </span>
            </motion.div>

            {/* Enhanced Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent
                  rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-500
                  hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2
                  focus:ring-offset-2 focus:ring-primary-500 font-medium transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                />
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <HiOutlineArrowRight className="w-5 h-5 text-primary-300 group-hover:text-primary-200" />
                    </span>
                    Create Account
                  </>
                )}
              </button>
            </motion.div>

            {/* Login Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-sm"
            >
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in
              </Link>
            </motion.p>
          </motion.form>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-gradient-to-br from-primary-500/30 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-gradient-to-tr from-primary-500/30 to-transparent rounded-full blur-xl" />
        </motion.div>

        {/* Updated Testimonials and Trust Indicators Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative hidden lg:block"
        >
          {/* Trust Indicators with Ethiopian Titles */}
          <div className="mb-12 bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                Why Choose Us
              </span>
              <span className="ml-2 text-sm text-yellow-400">የእኛን አገልግሎት ይምረጡ</span>
            </h3>
            {trustIndicators.map((indicator, index) => (
              <motion.div
                key={indicator.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-gradient-to-br from-green-500/20 to-yellow-500/20 rounded-lg">
                  {indicator.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    {indicator.title}
                  </h4>
                  <p className="text-blue-200">{indicator.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Testimonials */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) => (
                currentTestimonial === index && (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-green-500/50"
                        />
                        <motion.div
                          className="absolute -inset-1 rounded-full bg-gradient-to-br from-green-500/20 to-yellow-500/20"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.2, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-green-300">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-white/90 italic mb-4 leading-relaxed">"{testimonial.message}"</p>
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <HiOutlineStar className="w-5 h-5 text-yellow-400" />
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {/* Enhanced Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentTestimonial === index 
                      ? 'w-8 bg-gradient-to-r from-green-400 to-yellow-400' 
                      : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 
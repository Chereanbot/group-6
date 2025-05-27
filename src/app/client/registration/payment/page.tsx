"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineShieldCheck, 
  HiOutlineLightningBolt, 
  HiOutlineStar,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineGlobe
} from 'react-icons/hi';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ServiceType } from '@prisma/client';
import Image from 'next/image';

const CHAPA_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-40nSrRkEurW5fh4da1PD4YbDEnAEDgxg';

interface ClientProfile {
  fullName: string;
  email: string;
  phone: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
  color?: string;
  icon?: React.ReactNode;
  savings?: number;
  billingPeriod?: string;
  initialPayment: number;
  serviceType: ServiceType;
  description?: string;
}

const paymentPlans: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 1000,
    initialPayment: 25000,
    billingPeriod: 'month',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    icon: <HiOutlineShieldCheck className="w-8 h-8 text-blue-500" />,
    serviceType: ServiceType.CONSULTATION,
    description: 'Basic legal consultation and document review services',
    features: [
      'Standard case handling',
      'Email support',
      'Basic document review',
      'Single lawyer consultation',
      'Basic case tracking',
      'Standard response time',
      'Online document access',
      'Monthly case review',
      'Initial consultation included'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 2500,
    initialPayment: 35000,
    recommended: true,
    billingPeriod: 'month',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    icon: <HiOutlineLightningBolt className="w-8 h-8 text-purple-500" />,
    savings: 500,
    serviceType: ServiceType.DOCUMENT_PREPARATION,
    description: 'Comprehensive document preparation and legal assistance',
    features: [
      'Priority case handling',
      'Phone & email support',
      'Comprehensive document review',
      'Multiple lawyer consultations',
      'Case strategy planning',
      'Priority response time',
      'Advanced case tracking',
      'Bi-weekly case review',
      'Document templates',
      'Legal research assistance',
      'Premium initial consultation'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 5000,
    initialPayment: 50000,
    billingPeriod: 'month',
    color: 'bg-gradient-to-br from-yellow-500 to-amber-600',
    icon: <HiOutlineStar className="w-8 h-8 text-amber-500" />,
    savings: 1000,
    serviceType: ServiceType.COURT_APPEARANCE,
    description: 'Full legal representation and court appearance services',
    features: [
      'VIP case handling',
      '24/7 support access',
      'Full document management',
      'Senior lawyer assignment',
      'Strategy & planning sessions',
      'Court representation priority',
      'Instant response time',
      'Real-time case updates',
      'Weekly strategy meetings',
      'Dedicated case manager',
      'Premium document templates',
      'Legal research team',
      'Executive consultation package'
    ]
  }
];

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  plan: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'chapa',
    name: 'Chapa',
    icon: <HiOutlineCreditCard className="w-8 h-8 text-blue-500" />,
    description: 'Pay securely with your card or mobile money'
  },
  {
    id: 'cbe-birr',
    name: 'CBE Birr',
    icon: <HiOutlineCurrencyDollar className="w-8 h-8 text-green-500" />,
    description: 'Pay directly from your CBE Birr account'
  },
  {
    id: 'telebirr',
    name: 'Telebirr',
    icon: <HiOutlineCash className="w-8 h-8 text-purple-500" />,
    description: 'Quick mobile money payments via Telebirr'
  }
];

export default function PaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile>({
    fullName: '',
    email: '',
    phone: ''
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [profile, setProfile] = useState<ClientProfile>({
    fullName: '',
    email: '',
    phone: ''
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'plans' | 'profile' | 'payment'>('plans');
  const [scrollPosition, setScrollPosition] = useState(0);
  const plansSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      setServiceType(selectedPlan.serviceType);
    }
  }, [selectedPlan]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      await fetchUserProfile();
      await fetchPaymentHistory();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUserProfile = async () => {
    // Simulate API call to fetch user profile
    try {
      // In a real app, this would be an API call
      setTimeout(() => {
        setProfile({
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+251912345678'
        });
      }, 1000);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call to save profile
    setTimeout(() => {
      setIsProcessing(false);
      setProfileErrors({});
      setShowProfileDialog(false);
      setActiveTab('payment');
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
    }, 1500);
  };

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    
    if (!profile.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!profile.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!profile.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{10,15}$/.test(profile.phone.replace(/\s/g, ''))) {
      errors.phone = "Please enter a valid phone number";
    }
    
    return errors;
  };

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setActiveTab('profile');
  };

  const fetchPaymentHistory = async () => {
    // Simulate API call to fetch payment history
    setTimeout(() => {
      setPaymentHistory([
        {
          id: '1',
          date: '2023-05-15',
          amount: 25000,
          status: 'success',
          plan: 'Basic Plan'
        }
      ]);
    }, 1000);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handlePaymentConfirm = () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    setShowConfirmDialog(false);
    
    if (selectedPaymentMethod === 'chapa') {
      initializePayment(selectedPlan);
    } else if (selectedPaymentMethod === 'cbe-birr') {
      initializeCBEBirrPayment(selectedPlan);
    }
  };

  const initializePayment = (plan: PaymentPlan) => {
    // Simulate payment initialization
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "Payment Successful",
        description: `You have successfully subscribed to the ${plan.name}.`,
        variant: "default",
      });
      
      router.push('/client/dashboard');
    }, 2000);
  };

  const initializeCBEBirrPayment = (plan: PaymentPlan) => {
    // Simulate CBE Birr payment
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "CBE Birr Payment Initiated",
        description: "Please check your phone to complete the payment.",
        variant: "default",
      });
    }, 2000);
  };

  const calculatePrice = (price: number) => {
    if (isYearly) {
      // Apply 10% discount for yearly subscriptions
      return price * 12 * 0.9;
    }
    return price;
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-100 dark:bg-primary-900/20 opacity-50"
          style={{
            transform: `translate(${scrollPosition * 0.05}px, ${scrollPosition * -0.05}px)`
          }}
        />
        <div 
          className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-40"
          style={{
            transform: `translate(${scrollPosition * -0.03}px, ${scrollPosition * 0.03}px)`
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-yellow-100 dark:bg-yellow-900/20 opacity-30"
          style={{
            transform: `translate(${scrollPosition * 0.02}px, ${scrollPosition * 0.04}px)`
          }}
        />
      </div>
      
      {/* Header with animated gradient */}
      <div className="relative mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-block p-1 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-md px-4 py-1">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                Premium Legal Services
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
            Choose Your Premium Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Select the perfect legal service plan tailored to your needs and unlock premium features for your legal journey
          </p>
        </motion.div>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mt-8 mb-6">
          <div className="inline-flex rounded-md shadow-sm p-1 bg-gray-100 dark:bg-gray-800">
            {(['plans', 'profile', 'payment'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab 
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? 'text-primary-600 font-bold' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none
              ${isYearly ? 'bg-primary-600' : 'bg-gray-400'}`}
          >
            <div className={`absolute w-6 h-6 bg-white rounded-full transition-transform duration-300
              ${isYearly ? 'translate-x-9' : 'translate-x-1'}`}
            />
          </button>
          <span className={`text-sm ${isYearly ? 'text-primary-600 font-bold' : 'text-gray-500'}`}>
            Yearly (Save 10%)
          </span>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Payment Plans Section */}
      <AnimatePresence mode="wait">
        {activeTab === 'plans' && (
          <motion.div 
            key="plans-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
            ref={plansSectionRef}
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-between items-center mb-8"
            >
              <h2 className="text-2xl font-bold">Select Your Premium Plan</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Billed Monthly</span>
                <button 
                  onClick={() => setIsYearly(!isYearly)}
                  className="relative inline-flex items-center h-6 rounded-full w-12 transition-colors focus:outline-none"
                >
                  <span 
                    className={`
                      ${isYearly ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}
                      absolute h-6 w-12 mx-auto rounded-full transition-colors duration-300
                    `}
                  />
                  <span 
                    className={`
                      ${isYearly ? 'translate-x-6' : 'translate-x-1'}
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                    `}
                  />
                </button>
                <span>Billed Annually <span className="text-green-500 font-medium">Save 20%</span></span>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {paymentPlans.map((plan, index) => (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border-2 transition-all
                    ${selectedPlan?.id === plan.id ? 'border-primary-500 dark:border-primary-400 ring-4 ring-primary-500/30' : 'border-transparent'}
                    ${plan.recommended ? 'md:-translate-y-4' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 left-0">
                      <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white text-center py-1.5 text-sm font-bold shadow-md">
                        <motion.span
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="inline-flex items-center"
                        >
                          <HiOutlineSparkles className="w-4 h-4 mr-1" /> MOST POPULAR
                        </motion.span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-6 ${plan.color.replace('bg-', 'bg-opacity-10 ')} ${plan.recommended ? 'pt-12' : 'pt-6'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                      <div className="p-2 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-md">
                        {plan.icon}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{calculatePrice(plan.price).toLocaleString()}</span>
                        <span className="text-lg ml-1 text-gray-600 dark:text-gray-400">ETB</span>
                        <span className="text-sm ml-2 text-gray-500 dark:text-gray-500">/ {isYearly ? 'year' : 'month'}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                      {plan.savings && isYearly && (
                        <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                          Save {(plan.savings * 12 * 0.1).toLocaleString()} ETB/year
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial Payment</div>
                      <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{plan.initialPayment.toLocaleString()} ETB</div>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-4">
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">WHAT'S INCLUDED:</div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <motion.li 
                            key={idx} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.05) }}
                            className="flex items-start"
                          >
                            <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePlanSelect(plan)}
                      className={`relative w-full py-3 px-4 rounded-lg font-medium text-base transition-all overflow-hidden
                        ${selectedPlan?.id === plan.id
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-2 border-primary-500'
                          : `${plan.color} text-white shadow-lg hover:shadow-xl`}`}
                    >
                      {selectedPlan?.id === plan.id ? (
                        <span className="flex items-center justify-center">
                          <HiOutlineCheckCircle className="w-5 h-5 mr-2" /> Selected
                        </span>
                      ) : (
                        <>
                          <motion.div
                            animate={{
                              background: [
                                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                                'linear-gradient(90deg, rgba(255,255,255,0) 100%, rgba(255,255,255,0.2) 150%, rgba(255,255,255,0) 200%)'
                              ],
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "linear"
                            }}
                            className="absolute inset-0 overflow-hidden"
                          />
                          <span className="relative z-10">Get Started</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-center"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                All plans include a 7-day free trial. No credit card required.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <HiOutlineShieldCheck className="w-5 h-5 mr-1 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <HiOutlineUserGroup className="w-5 h-5 mr-1 text-blue-500" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <HiOutlineGlobe className="w-5 h-5 mr-1 text-purple-500" />
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Section */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <HiOutlineUserGroup className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Profile Information</h3>
                    <p className="text-gray-500 dark:text-gray-400">Please provide your details to continue</p>
                  </div>
                </div>
                
                {profileError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm mb-6 border-l-4 border-red-500"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {profileError}
                    </div>
                  </motion.div>
                )}
                
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <Input
                        id="fullName"
                        value={clientProfile.fullName}
                        onChange={(e) => setClientProfile({ ...clientProfile, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={clientProfile.email}
                        onChange={(e) => setClientProfile({ ...clientProfile, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <Input
                        id="phone"
                        value={clientProfile.phone}
                        onChange={(e) => setClientProfile({ ...clientProfile, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex justify-end space-x-3"
                >
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('plans')}
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Back to Plans
                  </Button>
                  <Button 
                    onClick={handleProfileSubmit} 
                    disabled={isProcessing}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Continue to Payment
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <HiOutlineShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                  <span>Your information is secure and will never be shared with third parties</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your information to continue with the payment process.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {profileError && (
              <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                {profileError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={clientProfile.fullName}
                onChange={(e) => setClientProfile({ ...clientProfile, fullName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clientProfile.email}
                onChange={(e) => setClientProfile({ ...clientProfile, email: e.target.value })}
                placeholder="Enter your email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={clientProfile.phone}
                onChange={(e) => setClientProfile({ ...clientProfile, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={clientProfile.fullName}
                  onChange={(e) => setClientProfile({ ...clientProfile, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientProfile.email}
                  onChange={(e) => setClientProfile({ ...clientProfile, email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={clientProfile.phone}
                  onChange={(e) => setClientProfile({ ...clientProfile, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
                {profileErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.phone}</p>
                )}
              </div>
            </div>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleProfileSubmit} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Please review your subscription details before proceeding with the payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedPlan && (
              <>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Subscription Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Plan:</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="font-medium">{selectedPlan.price.toLocaleString()} ETB/{selectedPlan.billingPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Initial Payment:</span>
                      <span className="font-medium">{selectedPlan.initialPayment.toLocaleString()} ETB</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Payment Method</h4>
                  {selectedPaymentMethod ? (
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">
                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                      </span>
                      <span className="font-medium">
                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-yellow-600 dark:text-yellow-400">
                      Please select a payment method
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Back
              </Button>
              <Button 
                onClick={handlePaymentConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment History Section */}
      <div className="mt-12">
        <button
          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
          {showPaymentHistory ? 'Hide Payment History' : 'Show Payment History'}
        </button>

        {showPaymentHistory && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Payment History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.length > 0 ? (
                      paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b dark:border-gray-700">
                          <td className="py-3 px-4">{new Date(payment.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{payment.plan}</td>
                          <td className="py-3 px-4">{payment.amount.toLocaleString()} ETB</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs
                              ${payment.status === 'success' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                          No payment history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold mb-2">Initializing Payment</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we redirect you to our secure payment gateway
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

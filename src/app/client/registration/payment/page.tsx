"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  HiOutlineShieldCheck, 
  HiOutlineLightningBolt, 
  HiOutlineStar,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineCash,
  HiOutlineCheck,
  HiX
} from 'react-icons/hi';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ServiceType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';

const CHAPA_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-BD18YWueJ7CDzcKw9n9YMfn55l1WeM8c';

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
    price: 25000,
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
      'Basic case tracking'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 35000,
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
      'Case strategy planning'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 50000,
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
      'Strategy & planning sessions'
    ]
  }
];

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
  }
];

interface PaymentRequestData {
  amount: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  tx_ref: string;
  serviceRequestId: string;
  callback_url?: string;
  return_url?: string;
  phoneNumber?: string;
}

interface PaymentResponseData {
  success: boolean;
  data?: {
    checkout_url?: string;
    CheckoutRequestID?: string;
  };
  error?: string;
  message?: string;
}

interface ServiceRequestResponse {
  id: string;
  // Add other fields as needed
}

interface AuthResponse {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    userRole: string;
  };
}

interface PaymentStatus {
  status: 'success' | 'failed' | 'pending' | 'unknown';
  message: string;
  transactionId?: string;
  amount?: number;
  date?: string;
}

function PaymentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'chapa' | 'mpesa'>('chapa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add validation for session and client role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          router.push('/auth/signin');
          return;
        }

        const data = await response.json();
        if (!data.isAuthenticated || data.user.userRole !== 'CLIENT') {
          toast({
            title: "Access Denied",
            description: "This page is only accessible to clients",
            variant: "destructive"
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [router]);

  const handlePlanSelect = async (plan: PaymentPlan) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue with payment",
          variant: "destructive"
        });
        router.push('/auth/signin');
        return;
      }

      const data = await response.json();
      if (!data.isAuthenticated || data.user.userRole !== 'CLIENT') {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to clients",
          variant: "destructive"
        });
        router.push('/');
        return;
      }

    setSelectedPlan(plan);
    setShowConfirmDialog(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/signin');
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId as 'chapa' | 'mpesa');
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPaymentMethod || !selectedPlan) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method to continue",
        variant: "destructive"
      });
      return;
    }

    try {
      const authResponse = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!authResponse.ok) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue with payment",
          variant: "destructive"
        });
        router.push('/auth/signin');
        return;
      }

      const authData: AuthResponse = await authResponse.json();
      if (!authData.isAuthenticated || authData.user.userRole !== 'CLIENT') {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to clients",
          variant: "destructive"
        });
        router.push('/');
      return;
    }
    
    setIsProcessing(true);
    
      // First create a service request
      const serviceRequestResponse = await fetch('/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPlan.id,
          title: `${selectedPlan.name} Service Request`,
          description: `Service request for ${selectedPlan.name}`,
          requirements: selectedPlan.features,
          serviceType: selectedPlan.serviceType,
        }),
      });

      if (!serviceRequestResponse.ok) {
        throw new Error('Failed to create service request');
      }

      const serviceRequest: ServiceRequestResponse = await serviceRequestResponse.json();

      // Generate unique transaction reference
      const tx_ref = `TX-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Initialize payment based on selected method
      const paymentEndpoint = selectedPaymentMethod === 'chapa' 
        ? '/api/payment/chapa/initialize'
        : '/api/payment/mpesa/initialize';

      const requestData: PaymentRequestData = selectedPaymentMethod === 'chapa' 
        ? {
            amount: selectedPlan.initialPayment,
            email: authData.user.email,
            firstName: authData.user.name?.split(' ')[0] || '',
            lastName: authData.user.name?.split(' ').slice(1).join(' ') || '',
            tx_ref,
            serviceRequestId: serviceRequest.id,
            callback_url: `${window.location.origin}/api/payment/chapa/verify`,
            return_url: `${window.location.origin}/client/registration/payment/success`,
          }
        : {
            amount: selectedPlan.price,
            phoneNumber,
            tx_ref,
            serviceRequestId: serviceRequest.id,
          };

      console.log('Sending payment data:', requestData);

      const paymentResponse = await fetch(paymentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData: PaymentResponseData = await paymentResponse.json();
      console.log('Payment response:', responseData);

      if (!paymentResponse.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to initialize payment');
      }

      if (selectedPaymentMethod === 'chapa') {
        if (!responseData.data?.checkout_url) {
          throw new Error('No checkout URL received from payment provider');
        }
        // Redirect to Chapa payment page
        window.location.href = responseData.data.checkout_url;
      } else {
        // Handle M-Pesa STK Push
        if (responseData.success) {
          // Show success message and instructions
          toast({
            title: "M-Pesa Payment",
            description: "Please check your phone for M-Pesa STK Push prompt to complete the payment.",
            variant: "default"
          });
          // Start polling for payment status
          if (responseData.data?.CheckoutRequestID) {
            pollPaymentStatus(tx_ref, responseData.data.CheckoutRequestID);
          } else {
            throw new Error('No CheckoutRequestID received from payment provider');
          }
        } else {
          throw new Error(responseData.message || 'Failed to initialize M-Pesa payment');
        }
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (tx_ref: string, checkoutRequestId: string) => {
    try {
      const response = await fetch('/api/payment/mpesa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref,
          CheckoutRequestID: checkoutRequestId,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.status === 'success') {
        toast({
          title: "Payment",
          description: "Payment completed successfully!",
          variant: "default"
        });
        // Redirect to success page after a delay
    setTimeout(() => {
          window.location.href = '/client/registration/payment/success';
    }, 2000);
      } else if (data.success && data.data.status === 'failed') {
        toast({
          title: "Payment Error",
          description: "Payment failed. Please try again.",
          variant: "destructive"
        });
      } else {
        // Continue polling
        setTimeout(() => pollPaymentStatus(tx_ref, checkoutRequestId), 5000);
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to verify payment status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('payment.title', 'Payment')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('payment.subtitle', 'Choose your payment method')}
        </p>
      </div>

      {/* Plans Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {paymentPlans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
              plan.recommended ? 'border-primary-500 dark:border-primary-400 transform scale-105' : 'border-transparent'
            }`}
          >
            {plan.recommended && (
              <div className="bg-primary-500 text-white text-center py-1 font-medium text-sm">
                {t('payment.plans.recommended', 'Recommended')}
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t(`payment.plans.${plan.id}.title`, plan.name)}
                </h3>
                {plan.icon}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t(`payment.plans.${plan.id}.description`, plan.description)}
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t(`payment.plans.${plan.id}.price`, `${plan.price} Birr`)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {t(`payment.plans.${plan.id}.duration`, '/month')}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                    <HiOutlineCheck className="w-5 h-5 text-green-500 mr-2" />
                    {t(`payment.plans.${plan.id}.features.${index + 1}`, feature)}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handlePlanSelect(plan)}
                className="w-full"
                variant={plan.recommended ? "default" : "outline"}
              >
                {t('payment.plans.select', 'Select Plan')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('payment.confirm.title', 'Confirm Payment')}</DialogTitle>
            <DialogDescription>
              {t('payment.confirm.description', 'Please review your subscription details before proceeding with the payment.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedPlan && (
              <>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('payment.confirm.subscription', 'Subscription Details')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('payment.confirm.plan', 'Plan Type')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {t(`payment.plans.${selectedPlan.id}.title`, selectedPlan.name)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('payment.confirm.price', 'Price')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {t(`payment.plans.${selectedPlan.id}.price`, `${selectedPlan.price} Birr`)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('payment.confirm.duration', 'Duration')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {t(`payment.plans.${selectedPlan.id}.duration`, '/month')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('payment.methods.title', 'Payment Methods')}
                  </h4>
                  <div className="space-y-3 mt-3">
                    {paymentMethods.map((method) => (
                      <div 
                        key={method.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id 
                            ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                      >
                        <div className="flex-shrink-0">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {t(`payment.methods.${method.id}`, method.name)}
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t(`payment.methods.${method.id}.description`, method.description)}
                          </p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <div className="text-primary-500">
                            <HiOutlineCheck className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                {t('payment.confirm.cancel', 'Cancel')}
              </Button>
              <Button 
                onClick={handlePaymentConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('payment.confirm.processing', 'Processing...')}
                  </>
                ) : (
                  t('payment.confirm.pay', 'Pay Now')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold mb-2">
              {t('payment.loading.title', 'Initializing Payment')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('payment.loading.description', 'Please wait while we redirect you to our secure payment gateway')}
            </p>
          </div>
        </div>
      )}

      {/* Payment Status Verification */}
      {paymentStatus && (
        <PaymentStatus />
      )}
    </div>
  );
}

const PaymentStatus = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const tx_ref = searchParams.get('tx_ref');
        if (!tx_ref) {
          setPaymentStatus({
            status: 'unknown',
            message: 'No transaction reference found'
          });
          return;
        }

        const response = await fetch('/api/payment/chapa/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tx_ref }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        setPaymentStatus({
          status: data.status === 'success' ? 'success' : 'failed',
          message: data.message || (data.status === 'success' ? 'Payment successful' : 'Payment failed'),
          transactionId: data.transactionId,
          amount: data.amount,
          date: data.date
        });

        if (data.status === 'success') {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully.",
          });
        } else {
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        setPaymentStatus({
          status: 'failed',
          message: error.message || 'Failed to verify payment status'
        });
        toast({
          title: "Verification Error",
          description: error.message || "Failed to verify payment status",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (!paymentStatus) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4"
      >
        {paymentStatus.status === 'success' ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        )}
        <h3 className="text-xl font-semibold mb-2">
          {t(`payment.status.${paymentStatus.status}.title`, paymentStatus.status === 'success' ? 'Payment Successful!' : 'Payment Failed')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {t(`payment.status.${paymentStatus.status}.description`, paymentStatus.message)}
        </p>

        {paymentStatus.status === 'success' && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              {paymentStatus.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('payment.success.transactionId', 'Transaction ID')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{paymentStatus.transactionId}</span>
                </div>
              )}
              {paymentStatus.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('payment.success.amount', 'Amount')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('payment.success.currency', 'ETB')} {paymentStatus.amount.toLocaleString()}
                  </span>
                </div>
              )}
              {paymentStatus.date && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('payment.success.date', 'Date')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{paymentStatus.date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {paymentStatus.status === 'success' ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/client/dashboard')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                {t('payment.success.goToDashboard', 'Go to Dashboard')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/client/services')}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('payment.success.viewServices', 'View Services')}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/client/registration/payment')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              {t('payment.error.tryAgain', 'Try Again')}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
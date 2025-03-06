"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CHAPA_PUBLIC_KEY = 'CHAPUBK_TEST-40nSrRkEurW5fh4da1PD4YbDEnAEDgxg';

interface ClientProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
  color?: string;
  icon?: string;
  savings?: number;
  billingPeriod?: string;
  initialPayment: number;
}

const paymentPlans: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 1000,
    initialPayment: 25000,
    billingPeriod: 'month',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    icon: '🔹',
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
    icon: '⭐',
    savings: 500,
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
    icon: '👑',
    savings: 1000,
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
  icon: string;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'chapa',
    name: 'Chapa',
    icon: '💳',
    description: 'Pay securely with your card or mobile money'
  },
  {
    id: 'cbe-birr',
    name: 'CBE Birr',
    icon: '🏦',
    description: 'Pay directly from your CBE Birr account'
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
    phone: '',
    address: '',
    idNumber: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('chapa');

  useEffect(() => {
    fetchPaymentHistory();
    fetchUserProfile();

    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setError('Payment failed. Please try again.');
      toast({
        title: "Payment Failed",
        description: "Your payment could not be processed. Please try again.",
        variant: "destructive"
      });
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/client/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setClientProfile(prev => ({
            ...prev,
            fullName: data.data.user.fullName || '',
            email: data.data.user.email || '',
            phone: data.data.user.phone || '',
            address: data.data.region + ', ' + data.data.zone + ', ' + data.data.wereda + ', ' + data.data.kebele || '',
            idNumber: data.data.idNumber || ''
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your profile information. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) {
      return;
    }
    setShowProfileDialog(false);
    setShowConfirmDialog(true);
  };

  const validateProfile = () => {
    if (!clientProfile.fullName || !clientProfile.email || !clientProfile.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setShowProfileDialog(true);
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/payment/history');
      const data = await response.json();
      if (response.ok) {
        setPaymentHistory(data.payments);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPlan || !selectedPaymentMethod) return;
    setShowConfirmDialog(false);
    
    if (selectedPaymentMethod === 'chapa') {
      await initializePayment(selectedPlan);
    } else if (selectedPaymentMethod === 'cbe-birr') {
      await initializeCBEBirrPayment(selectedPlan);
    }
  };

  const initializePayment = async (plan: PaymentPlan) => {
    setIsProcessing(true);
    setError(null);

    try {
      const payload = {
        amount: plan.initialPayment,
        currency: 'ETB',
        email: clientProfile.email,
        first_name: clientProfile.fullName.split(' ')[0],
        last_name: clientProfile.fullName.split(' ').slice(1).join(' '),
        phone: clientProfile.phone,
        customization: {
          title: 'Legal Payment',
          description: `${plan.name} Initial Payment`
        },
        metadata: {
          planId: plan.id,
          billingPeriod: isYearly ? 'yearly' : 'monthly',
          clientProfile: clientProfile
        }
      };

      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = typeof data.message === 'object' 
          ? JSON.stringify(data.message) 
          : data.message || 'Failed to initialize payment';
        throw new Error(errorMessage);
      }

      if (!data.success || !data.data?.checkout_url) {
        throw new Error('Failed to get checkout URL');
      }

      localStorage.setItem('selectedPlan', JSON.stringify({
        ...plan,
        tx_ref: data.data.tx_ref,
        isYearly,
        clientProfile
      }));
      
      window.location.href = data.data.checkout_url;

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      setError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeCBEBirrPayment = async (plan: PaymentPlan) => {
    setIsProcessing(true);
    setError(null);

    try {
      const payload = {
        amount: plan.initialPayment,
        currency: 'ETB',
        email: clientProfile.email,
        fullName: clientProfile.fullName,
        phone: clientProfile.phone,
        paymentMethod: 'CBE_BIRR',
        metadata: {
          planId: plan.id,
          billingPeriod: isYearly ? 'yearly' : 'monthly',
          clientProfile: clientProfile
        }
      };

      const cbeResponse = await fetch('/api/payment/cbe-birr/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const cbeData = await cbeResponse.json();

      if (!cbeResponse.ok) {
        throw new Error(cbeData.message || 'Failed to initialize CBE Birr payment');
      }

      // Store selected plan details
      localStorage.setItem('selectedPlan', JSON.stringify({
        ...plan,
        tx_ref: cbeData.data.tx_ref,
        isYearly,
        clientProfile
      }));
      
      // Redirect to CBE Birr payment page or show account number
      if (cbeData.data.accountNumber) {
        toast({
          title: "CBE Birr Payment",
          description: `Please transfer ${plan.initialPayment.toLocaleString()} ETB to account number: ${cbeData.data.accountNumber}`,
          duration: 10000
        });
      } else if (cbeData.data.redirectUrl) {
        window.location.href = cbeData.data.redirectUrl;
      }

    } catch (error) {
      console.error('CBE Birr payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process CBE Birr payment';
      setError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePrice = (price: number) => {
    if (isYearly) {
      const yearlyPrice = price * 12;
      const discount = yearlyPrice * 0.1; // 10% discount
      return yearlyPrice - discount;
    }
    return price;
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
          Choose Your Legal Service Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Select the perfect plan for your legal needs
        </p>
        
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

      {/* Payment Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {paymentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            className={`
              relative overflow-hidden rounded-2xl shadow-xl
              ${plan.recommended ? 'ring-4 ring-primary-500 ring-opacity-50' : ''}
              ${isProcessing ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-lg">
                Recommended
              </div>
            )}
            
            <div className={`${plan.color} p-6 text-white`}>
              <div className="text-center">
                <span className="text-3xl mb-2">{plan.icon}</span>
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="text-4xl font-bold mb-2">
                  {calculatePrice(plan.price).toLocaleString()} ETB
                  <span className="text-sm font-normal">/{isYearly ? 'year' : 'month'}</span>
                </div>
                {plan.savings && isYearly && (
                  <div className="text-sm bg-white/20 rounded-full px-3 py-1 inline-block">
                    Save {(plan.savings * 12 * 0.1).toLocaleString()} ETB/year
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6">
              <div className="mb-4 text-center">
                <div className="text-lg font-semibold text-primary-600">
                  Initial Payment Required
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.initialPayment.toLocaleString()} ETB
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan)}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
                  ${plan.recommended
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                  }
                `}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Client Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your information to proceed with the payment
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                required
                value={clientProfile.fullName}
                onChange={(e) => setClientProfile(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                required
                type="email"
                value={clientProfile.email}
                onChange={(e) => setClientProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                required
                value={clientProfile.phone}
                onChange={(e) => setClientProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={clientProfile.address}
                onChange={(e) => setClientProfile(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ID Number</label>
              <Input
                value={clientProfile.idNumber}
                onChange={(e) => setClientProfile(prev => ({ ...prev, idNumber: e.target.value }))}
                placeholder="Enter your ID number"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Continue
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Please select your payment method and review the details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlan && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Plan</h4>
                  <p>{selectedPlan.name}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Initial Payment</h4>
                  <p className="text-xl font-bold">{selectedPlan.initialPayment.toLocaleString()} ETB</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Monthly Fee</h4>
                  <p>{selectedPlan.price.toLocaleString()} ETB/{isYearly ? 'year' : 'month'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Client Details</h4>
                  <p>{clientProfile.fullName}</p>
                  <p>{clientProfile.email}</p>
                  <p>{clientProfile.phone}</p>
                  <p>{clientProfile.address}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-200'
                        }`}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </button>
                    ))}
                  </div>
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
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';

// Payment plan interface
interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

// Payment plans data
const paymentPlans: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    description: 'Standard definition streaming',
    features: ['1 screen', 'SD quality', 'Mobile & tablet', 'Download for offline']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 15.99,
    description: 'High definition streaming',
    features: ['2 screens', 'HD quality', 'Mobile & tablet', 'Download for offline'],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    description: 'Ultra high definition streaming',
    features: ['4 screens', '4K Ultra HD', 'Mobile & tablet', 'Download for offline']
  }
];

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }

  return {
    props: {}
  };
}

const Payment = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handlePayment = useCallback(async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await axios.post('/api/payment/create-payment-intent', {
        planId: selectedPlan,
        userId: session?.user?.email
      });

      if (response.data.success) {
        // Redirect to external payment page or handle payment
        if (response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          // Handle success case
          router.push('/payment/success');
        }
      } else {
        setError(response.data.error || 'Payment processing failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlan, session, router]);

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-300">
              Select the perfect plan for your entertainment needs
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Payment Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {paymentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gray-900 rounded-lg p-8 border-2 transition-all duration-200 cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'border-red-500 bg-gray-800'
                    : 'border-gray-700 hover:border-gray-600'
                } ${plan.popular ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Button */}
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`px-12 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                isProcessing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                `Subscribe to ${paymentPlans.find(p => p.id === selectedPlan)?.name} Plan`
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios';

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

const PaymentSuccess = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch subscription details if session_id is present
    const sessionId = router.query.session_id as string;
    if (sessionId) {
      fetchSubscriptionDetails(sessionId);
    } else {
      setLoading(false);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const fetchSubscriptionDetails = async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/payment/subscription-status`);
      if (response.data.success) {
        setSubscriptionDetails(response.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-300 text-lg">
            Welcome to Netflix! Your subscription is now active.
          </p>
          {subscriptionDetails && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <p className="text-white font-semibold">
                {subscriptionDetails.plan.charAt(0).toUpperCase() + subscriptionDetails.plan.slice(1)} Plan
              </p>
              <p className="text-gray-300 text-sm">
                Status: {subscriptionDetails.status}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            What's Next?
          </h2>
          <ul className="text-gray-300 space-y-2 text-left">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Start watching your favorite shows and movies
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Create your watchlist and favorites
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Download content for offline viewing
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Watching Now
          </button>
          
          <p className="text-gray-400 text-sm">
            Redirecting to home page in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

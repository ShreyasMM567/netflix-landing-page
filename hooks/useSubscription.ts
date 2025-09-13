import useSWR from 'swr';
import { fetcher } from '../lib/fetcher';

interface Subscription {
  status: string;
  plan: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface SubscriptionResponse {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

const useSubscription = () => {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionResponse>(
    '/api/payment/subscription-status',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    subscription: data?.subscription,
    isLoading,
    error: error || data?.error,
    mutate
  };
};

export default useSubscription;

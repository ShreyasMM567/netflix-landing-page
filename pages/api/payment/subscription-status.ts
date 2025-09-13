import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prismadb from '../../../lib/prismadb';

interface SubscriptionStatusResponse {
  success: boolean;
  subscription?: {
    status: string;
    plan: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubscriptionStatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get user subscription information
    const user = await prismadb.user.findUnique({
      where: { email: session.user?.email },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isActive = user.subscriptionStatus === 'active' && 
                    user.subscriptionEndDate && 
                    new Date(user.subscriptionEndDate) > new Date();

    return res.status(200).json({
      success: true,
      subscription: {
        status: user.subscriptionStatus || 'inactive',
        plan: user.subscriptionPlan || 'none',
        startDate: user.subscriptionStartDate?.toISOString() || '',
        endDate: user.subscriptionEndDate?.toISOString() || '',
        isActive
      }
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

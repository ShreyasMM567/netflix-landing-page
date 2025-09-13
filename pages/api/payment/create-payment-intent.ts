import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Stripe from 'stripe';

interface PaymentIntentRequest {
  planId: string;
  userId: string;
}

interface PaymentIntentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
  paymentIntentId?: string;
}

// Validate required environment variables
if (!process.env.PAYMENT_API_KEY) {
  console.error('PAYMENT_API_KEY is not set in environment variables');
}

// Initialize Stripe
const stripe = new Stripe(process.env.PAYMENT_API_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Plan pricing and Stripe price IDs
const PLAN_PRICING = {
  basic: { 
    price: 9.99, 
    currency: 'USD',
    priceId: process.env.STRIPE_BASIC_PRICE_ID
  },
  standard: { 
    price: 15.99, 
    currency: 'USD',
    priceId: process.env.STRIPE_STANDARD_PRICE_ID
  },
  premium: { 
    price: 19.99, 
    currency: 'USD',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentIntentResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !(session as any).user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { planId, userId }: PaymentIntentRequest = req.body;

    // Validate input
    if (!planId || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Plan ID and User ID are required' 
      });
    }

    // Validate plan exists
    if (!PLAN_PRICING[planId as keyof typeof PLAN_PRICING]) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid plan selected' 
      });
    }

    const plan = PLAN_PRICING[planId as keyof typeof PLAN_PRICING];

    // Check if price ID is set
    if (!plan.priceId) {
      return res.status(400).json({
        success: false,
        error: `Price ID for ${planId} plan is not configured. Please set STRIPE_${planId.toUpperCase()}_PRICE_ID in your environment variables.`
      });
    }

    try {
      // Create or retrieve customer
      const customer = await stripe.customers.create({
        email: (session as any).user?.email || userId,
        metadata: {
          userId: userId,
          planId: planId
        }
      });

      // Get base URL with fallback
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      // Create checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment?cancelled=true`,
        metadata: {
          userId: userId,
          planId: planId,
          userEmail: (session as any).user?.email || userId
        }
      });

      return res.status(200).json({
        success: true,
        paymentUrl: checkoutSession.url || undefined,
        paymentIntentId: checkoutSession.id
      });

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      return res.status(400).json({
        success: false,
        error: stripeError.message || 'Failed to create payment session'
      });
    }

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.PAYMENT_API_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create Netflix product
    const product = await stripe.products.create({
      name: 'Netflix Subscription',
      description: 'Access to Netflix streaming service',
      metadata: {
        service: 'netflix-clone'
      }
    });

    // Create prices for each plan
    const prices = await Promise.all([
      // Basic Plan - $9.99/month
      stripe.prices.create({
        unit_amount: 999, // $9.99 in cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
        nickname: 'Basic Plan',
        metadata: {
          plan: 'basic',
          features: '1 screen, SD quality, Mobile & tablet, Download for offline'
        }
      }),
      
      // Standard Plan - $15.99/month
      stripe.prices.create({
        unit_amount: 1599, // $15.99 in cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
        nickname: 'Standard Plan',
        metadata: {
          plan: 'standard',
          features: '2 screens, HD quality, Mobile & tablet, Download for offline'
        }
      }),
      
      // Premium Plan - $19.99/month
      stripe.prices.create({
        unit_amount: 1999, // $19.99 in cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
        nickname: 'Premium Plan',
        metadata: {
          plan: 'premium',
          features: '4 screens, 4K Ultra HD, Mobile & tablet, Download for offline'
        }
      })
    ]);

    const result = {
      product: {
        id: product.id,
        name: product.name,
        description: product.description
      },
      prices: prices.map(price => ({
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        nickname: price.nickname,
        plan: price.metadata?.plan,
        features: price.metadata?.features
      }))
    };

    console.log('Stripe setup completed:', result);

    return res.status(200).json({
      success: true,
      message: 'Stripe products and prices created successfully',
      data: result
    });

  } catch (error: any) {
    console.error('Stripe setup error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to setup Stripe products and prices'
    });
  }
}

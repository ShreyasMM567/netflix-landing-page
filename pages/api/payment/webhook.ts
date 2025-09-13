import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import prismadb from '../../../lib/prismadb';

const stripe = new Stripe(process.env.PAYMENT_API_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ error: 'No signature provided' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle different Stripe events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const { userId, planId, userEmail } = session.metadata || {};

  if (!planId || !userId) {
    console.error('Missing required metadata in checkout session');
    return;
  }

  try {
    // Update user subscription status
    await prismadb.user.update({
      where: { email: userEmail || userId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: planId,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentIntentId: session.id
      } as any
    });

    console.log(`Checkout completed for user ${userId}, plan ${planId}`);
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  
  if (!(invoice as any).subscription) {
    console.error('No subscription found in invoice');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  const { userId, planId } = subscription.metadata || {};

  if (!planId || !userId) {
    console.error('Missing required metadata in invoice payment');
    return;
  }

  try {
    // Update user subscription status
    await prismadb.user.update({
      where: { email: (customer as Stripe.Customer).email || userId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: planId,
        subscriptionEndDate: new Date((subscription as any).current_period_end * 1000)
      } as any
    });

    console.log(`Invoice payment succeeded for user ${userId}, plan ${planId}`);
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  
  if (!(invoice as any).subscription) {
    console.error('No subscription found in invoice');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  const { userId } = subscription.metadata || {};

  try {
    // Update user subscription status to failed
    await prismadb.user.update({
      where: { email: (customer as Stripe.Customer).email || userId },
      data: {
        subscriptionStatus: 'payment_failed'
      } as any
    });

    console.log(`Invoice payment failed for user ${userId}`);
  } catch (error) {
    console.error('Error updating user payment failure:', error);
  }
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const { planId, userId } = subscription.metadata || {};

  try {
    await prismadb.user.update({
      where: { email: (customer as Stripe.Customer).email || userId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: planId,
        subscriptionId: subscription.id,
        subscriptionStartDate: new Date(subscription.created * 1000),
        subscriptionEndDate: new Date((subscription as any).current_period_end * 1000)
      } as any
    });

    console.log(`Subscription created for user ${userId}, plan ${planId}`);
  } catch (error) {
    console.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const { userId } = subscription.metadata || {};

  try {
    await prismadb.user.update({
      where: { email: (customer as Stripe.Customer).email || userId },
      data: {
        subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
        subscriptionEndDate: new Date((subscription as any).current_period_end * 1000)
      } as any
    });

    console.log(`Subscription updated for user ${userId}, status: ${subscription.status}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const { userId } = subscription.metadata || {};

  try {
    await prismadb.user.update({
      where: { email: (customer as Stripe.Customer).email || userId },
      data: {
        subscriptionStatus: 'cancelled',
        subscriptionEndDate: new Date()
      } as any
    });

    console.log(`Subscription cancelled for user ${userId}`);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
  }
}
# Stripe Integration Setup Guide

This guide will help you set up Stripe payment integration for your Netflix clone.

## Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **Stripe CLI** (optional): For local webhook testing

## Step 1: Get Your Stripe Keys

1. Log in to your Stripe Dashboard
2. Go to **Developers > API Keys**
3. Copy your **Publishable key** and **Secret key**
4. For testing, use the **Test mode** keys (they start with `pk_test_` and `sk_test_`)

## Step 2: Set Up Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# Stripe Configuration
PAYMENT_API_KEY=sk_test_your_stripe_secret_key_here
PAYMENT_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (get these from running /api/payment/setup-stripe)
STRIPE_BASIC_PRICE_ID=price_basic_monthly_id
STRIPE_STANDARD_PRICE_ID=price_standard_monthly_id
STRIPE_PREMIUM_PRICE_ID=price_premium_monthly_id
```

## Step 3: Create Stripe Products and Prices

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Make a POST request to create products and prices:
   ```bash
   curl -X POST http://localhost:3000/api/payment/setup-stripe
   ```

   Or use a tool like Postman to make the request.

3. Copy the returned price IDs and add them to your `.env.local` file.

## Step 4: Set Up Webhooks

### For Production:
1. In your Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/payment/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it to your environment variables

### For Local Development:
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/payment/webhook
   ```
4. Copy the webhook signing secret from the CLI output

## Step 5: Test the Integration

1. **Test Payment Flow**:
   - Go to `/payment` in your app
   - Select a subscription plan
   - Use Stripe's test card numbers:
     - Success: `4242 4242 4242 4242`
     - Decline: `4000 0000 0000 0002`
     - 3D Secure: `4000 0025 0000 3155`

2. **Test Webhooks**:
   - Complete a test payment
   - Check your database to ensure subscription status is updated
   - Check server logs for webhook events

## Step 6: Database Setup

Make sure your database schema is up to date:

```bash
npx prisma db push
```

## Available API Endpoints

- `POST /api/payment/create-payment-intent` - Creates a Stripe checkout session
- `POST /api/payment/webhook` - Handles Stripe webhook events
- `GET /api/payment/subscription-status` - Returns user subscription status
- `POST /api/payment/setup-stripe` - Creates Stripe products and prices

## Test Card Numbers

Use these test card numbers for testing:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Visa - Success |
| 4000 0000 0000 0002 | Visa - Declined |
| 4000 0025 0000 3155 | Visa - 3D Secure |
| 5555 5555 5555 4444 | Mastercard - Success |
| 3782 822463 10005 | American Express - Success |

## Troubleshooting

### Common Issues:

1. **Webhook signature verification failed**:
   - Check that your webhook secret is correct
   - Ensure the webhook endpoint URL is accessible

2. **Price ID not found**:
   - Run the setup-stripe endpoint to create products and prices
   - Update your environment variables with the correct price IDs

3. **Database errors**:
   - Run `npx prisma db push` to update your database schema
   - Check that all subscription fields are properly defined

4. **Authentication errors**:
   - Ensure NextAuth is properly configured
   - Check that the user session is valid

### Debug Mode:

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed logs in your console.

## Production Deployment

1. **Switch to Live Keys**:
   - Replace test keys with live keys in production
   - Update webhook endpoints to your production domain

2. **Security**:
   - Never expose your secret keys in client-side code
   - Use environment variables for all sensitive data
   - Enable webhook signature verification

3. **Monitoring**:
   - Set up Stripe Dashboard alerts
   - Monitor webhook delivery in the Stripe Dashboard
   - Check your application logs for errors

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

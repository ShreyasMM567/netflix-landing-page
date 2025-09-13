This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Payment Integration

This Netflix clone includes a complete payment system with external API integration for subscription management.

### Features

- **Subscription Plans**: Basic ($9.99), Standard ($15.99), and Premium ($19.99) plans
- **External Payment API**: Integrates with external payment services (Stripe, PayPal, etc.)
- **Webhook Support**: Handles payment events and subscription updates
- **Subscription Management**: Track user subscription status and plan details
- **Secure Processing**: Server-side payment intent creation and webhook verification

### Payment Routes

- `/payment` - Subscription plan selection and payment processing
- `/payment/success` - Payment success confirmation page
- `/api/payment/create-payment-intent` - Creates payment intent with external service
- `/api/payment/webhook` - Handles payment webhooks from external service
- `/api/payment/subscription-status` - Returns current user subscription status

### Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
PAYMENT_API_KEY=sk_test_your_stripe_secret_key_here
PAYMENT_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (get these from running /api/payment/setup-stripe)
STRIPE_BASIC_PRICE_ID=price_basic_monthly_id
STRIPE_STANDARD_PRICE_ID=price_standard_monthly_id
STRIPE_PREMIUM_PRICE_ID=price_premium_monthly_id
```

### Database Schema

The User model includes subscription tracking fields:

```prisma
model User {
  // ... existing fields
  
  // Subscription fields
  subscriptionStatus String? @default("inactive")
  subscriptionPlan String?
  subscriptionId String?
  subscriptionStartDate DateTime?
  subscriptionEndDate DateTime?
  paymentIntentId String?
}
```

### Usage

1. **Access Payment Page**: Click "Manage Subscription" in the account menu
2. **Select Plan**: Choose from Basic, Standard, or Premium plans
3. **Process Payment**: Click subscribe to redirect to external payment service
4. **Handle Webhooks**: Payment service sends webhooks to update subscription status
5. **Check Status**: Use the subscription status API to verify active subscriptions

### Stripe Integration

This application is now fully integrated with Stripe for payment processing. 

**Quick Setup:**
1. Get your Stripe keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Run the setup endpoint to create products and prices: `POST /api/payment/setup-stripe`
3. Configure webhooks in your Stripe Dashboard
4. Update your environment variables with the price IDs

**For detailed setup instructions, see [STRIPE_SETUP.md](./STRIPE_SETUP.md)**

### Key Features

- **Stripe Checkout**: Secure payment processing with Stripe's hosted checkout
- **Subscription Management**: Automatic subscription creation and management
- **Webhook Handling**: Real-time subscription status updates
- **Test Mode**: Full testing support with Stripe's test cards

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

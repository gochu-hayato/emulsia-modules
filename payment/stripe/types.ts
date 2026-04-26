import type Stripe from 'stripe';

export type StripeEvent = ReturnType<Stripe.Stripe['webhooks']['constructEvent']>;

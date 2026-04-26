import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';
import type { StripeEvent } from './types';

export { StripeEvent } from './types';

export const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');

export function handleWebhook(
  rawBody: Buffer,
  signature: string,
  secret: string,
): StripeEvent {
  const apiKey = stripeSecretKey.value();

  if (!apiKey) {
    throw new Error(
      'STRIPE_SECRET_KEY が設定されていません。Cloud Functions のシークレット設定を確認してください。',
    );
  }

  const stripe = new Stripe(apiKey);
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

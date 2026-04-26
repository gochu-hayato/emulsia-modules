import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';

export type { StripeEvent } from './types';
export { handleWebhook, stripeSecretKey } from './webhook';

const stripeKey = defineSecret('STRIPE_SECRET_KEY');

function getStripeClient() {
  const apiKey = stripeKey.value();

  if (!apiKey) {
    throw new Error(
      'STRIPE_SECRET_KEY が設定されていません。Cloud Functions のシークレット設定を確認してください。',
    );
  }

  return new Stripe(apiKey);
}

export async function createPaymentIntent(
  amount: number,
  currency = 'jpy',
): Promise<string> {
  const stripe = getStripeClient();

  const intent = await stripe.paymentIntents.create({ amount, currency });

  if (!intent.client_secret) {
    throw new Error('PaymentIntent の client_secret が取得できませんでした');
  }

  return intent.client_secret;
}

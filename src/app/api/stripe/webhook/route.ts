import { error, ok } from '@/server/http';
import { handleStripeWebhook } from '@/server/stripe/subscriptions';
import { logStripeSubscriptionEvent } from '@/server/stripe/subscription-logger';

function isSignatureVerificationError(err: unknown) {
  if (!(err instanceof Error)) return false;
  const stripeType = (err as { type?: string }).type;
  if (stripeType === 'StripeSignatureVerificationError') return true;
  const message = err.message.toLowerCase();
  return message.includes('signature');
}

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  try {
    await handleStripeWebhook({
      signature,
      rawBody,
    });
    return ok({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process Stripe webhook';
    const status = isSignatureVerificationError(err) ? 400 : 500;
    logStripeSubscriptionEvent('webhook_error', {
      message,
      status,
    });
    return error(
      'WEBHOOK_ERROR',
      status === 400 ? 'Invalid Stripe webhook signature.' : 'Failed to process Stripe webhook.',
      status,
    );
  }
}

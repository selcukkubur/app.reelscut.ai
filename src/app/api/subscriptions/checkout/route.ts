import { NextRequest } from 'next/server';
import { withApiError } from '@/server/errors';
import { error, ok, unauthorized } from '@/server/http';
import { getAuthSession } from '@/server/auth';
import { createStripeCheckoutSession } from '@/server/stripe/subscriptions';
import { isStripePricingConfigured } from '@/server/stripe/client';
import { getUserSubscriptionStatus } from '@/server/subscriptions';

type CheckoutBody = {
  plan?: 'weekly' | 'monthly';
};

export const POST = withApiError(async function POST(req: NextRequest) {
  const session = await getAuthSession();
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  const userId = user?.id;
  if (!userId) return unauthorized();

  if (!isStripePricingConfigured()) {
    return error('CONFIG_ERROR', 'Stripe subscriptions are not configured.', 500);
  }

  const body = (await req.json().catch(() => null)) as CheckoutBody | null;
  const plan = body?.plan;
  if (plan !== 'weekly' && plan !== 'monthly') {
    return error('VALIDATION_ERROR', 'Plan must be either "weekly" or "monthly".', 400);
  }

  const currentSubscription = await getUserSubscriptionStatus(userId);
  if (currentSubscription.active) {
    return error(
      'SUBSCRIPTION_ACTIVE',
      'You already have an active subscription. Manage billing to update it.',
      409,
    );
  }

  const checkout = await createStripeCheckoutSession({
    userId,
    userEmail: user?.email ?? null,
    planKey: plan,
  });

  return ok({
    url: checkout.url,
    sessionId: checkout.sessionId,
  });
}, 'Failed to create subscription checkout session');

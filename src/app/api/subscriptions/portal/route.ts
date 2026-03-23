import { NextRequest } from 'next/server';
import { withApiError } from '@/server/errors';
import { error, ok, unauthorized } from '@/server/http';
import { getAuthSession } from '@/server/auth';
import { createStripeBillingPortalSession } from '@/server/stripe/subscriptions';
import { isStripePricingConfigured } from '@/server/stripe/client';

export const POST = withApiError(async function POST(_req: NextRequest) {
  const session = await getAuthSession();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return unauthorized();

  if (!isStripePricingConfigured()) {
    return error('CONFIG_ERROR', 'Stripe subscriptions are not configured.', 500);
  }

  const portal = await createStripeBillingPortalSession(user.id);
  return ok(portal);
}, 'Failed to create Stripe billing portal session');

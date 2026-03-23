import { NextRequest } from 'next/server';
import { withApiError } from '@/server/errors';
import { ok, unauthorized } from '@/server/http';
import { getAuthSession } from '@/server/auth';
import { getWebSubscriptionStatus } from '@/server/stripe/subscriptions';

export const GET = withApiError(async function GET(_req: NextRequest) {
  const session = await getAuthSession();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return unauthorized();

  const status = await getWebSubscriptionStatus(user.id);
  return ok(status);
}, 'Failed to load subscription status');

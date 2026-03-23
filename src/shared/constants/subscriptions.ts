export type SubscriptionProductConfig = {
  planKey: 'weekly' | 'monthly';
  productId: string;
  tokens: number;
  label: string;
  interval: 'week' | 'month';
  priceUsd: number;
};

export const SUBSCRIPTION_PRODUCTS: Record<string, SubscriptionProductConfig> = {
  yumcut_weekly_basic: {
    planKey: 'weekly',
    productId: 'yumcut_weekly_basic',
    tokens: 150,
    label: 'Weekly',
    interval: 'week',
    priceUsd: 6.99,
  },
  yumcut_monthly_basic: {
    planKey: 'monthly',
    productId: 'yumcut_monthly_basic',
    tokens: 600,
    label: 'Monthly',
    interval: 'month',
    priceUsd: 20,
  },
};

export const SUBSCRIPTION_PRODUCTS_BY_PLAN_KEY: Record<
  SubscriptionProductConfig['planKey'],
  SubscriptionProductConfig
> = {
  weekly: SUBSCRIPTION_PRODUCTS.yumcut_weekly_basic,
  monthly: SUBSCRIPTION_PRODUCTS.yumcut_monthly_basic,
};

export function getSubscriptionConfig(productId: string | undefined | null) {
  if (!productId) return undefined;
  return SUBSCRIPTION_PRODUCTS[productId];
}

function normalizePriceId(value: string | undefined | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stripePriceIdForPlanKey(planKey: SubscriptionProductConfig['planKey']) {
  if (planKey === 'weekly') {
    return normalizePriceId(process.env.STRIPE_WEEKLY_PRICE_ID);
  }
  return normalizePriceId(process.env.STRIPE_MONTHLY_PRICE_ID);
}

export function getStripePriceIdForProductId(productId: string | undefined | null) {
  const config = getSubscriptionConfig(productId);
  if (!config) return null;
  return stripePriceIdForPlanKey(config.planKey);
}

export function getSubscriptionConfigByStripePriceId(priceId: string | undefined | null) {
  const normalized = normalizePriceId(priceId);
  if (!normalized) return undefined;

  const entries = Object.values(SUBSCRIPTION_PRODUCTS);
  for (const entry of entries) {
    if (stripePriceIdForPlanKey(entry.planKey) === normalized) {
      return entry;
    }
  }
  return undefined;
}

export function getConfiguredStripeSubscriptionPlans() {
  const plans: Array<
    SubscriptionProductConfig & {
      stripePriceId: string;
    }
  > = [];

  for (const entry of Object.values(SUBSCRIPTION_PRODUCTS_BY_PLAN_KEY)) {
    const stripePriceId = stripePriceIdForPlanKey(entry.planKey);
    if (!stripePriceId) continue;
    plans.push({
      ...entry,
      stripePriceId,
    });
  }

  return plans;
}

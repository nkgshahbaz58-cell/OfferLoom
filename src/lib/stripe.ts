import Stripe from "stripe";

export function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: "2024-06-20",
    typescript: true,
  });
}

export async function syncStripeCustomers(
  stripe: Stripe,
  workspaceId: string,
  db: typeof import("./db").db
) {
  const customers: Stripe.Customer[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const response = await stripe.customers.list({
      limit: 100,
      starting_after: startingAfter,
    });

    customers.push(...response.data);
    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  for (const customer of customers) {
    await db.customer.upsert({
      where: {
        workspaceId_stripeCustomerId: {
          workspaceId,
          stripeCustomerId: customer.id,
        },
      },
      create: {
        workspaceId,
        stripeCustomerId: customer.id,
        email: customer.email,
        name: customer.name,
      },
      update: {
        email: customer.email,
        name: customer.name,
      },
    });
  }

  return customers.length;
}

export async function syncStripeSubscriptions(
  stripe: Stripe,
  workspaceId: string,
  db: typeof import("./db").db
) {
  const subscriptions: Stripe.Subscription[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const response = await stripe.subscriptions.list({
      limit: 100,
      starting_after: startingAfter,
      status: "all",
    });

    subscriptions.push(...response.data);
    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  for (const sub of subscriptions) {
    const customer = await db.customer.findUnique({
      where: {
        workspaceId_stripeCustomerId: {
          workspaceId,
          stripeCustomerId: sub.customer as string,
        },
      },
    });

    if (!customer) continue;

    const planItem = sub.items.data[0];
    const price = planItem?.price;

    await db.subscription.upsert({
      where: {
        workspaceId_stripeSubscriptionId: {
          workspaceId,
          stripeSubscriptionId: sub.id,
        },
      },
      create: {
        workspaceId,
        customerId: customer.id,
        stripeSubscriptionId: sub.id,
        status: sub.status,
        planId: price?.id,
        planName: price?.nickname,
        planAmount: price?.unit_amount,
        currency: price?.currency || "usd",
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
      },
      update: {
        status: sub.status,
        planId: price?.id,
        planName: price?.nickname,
        planAmount: price?.unit_amount,
        currency: price?.currency || "usd",
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
      },
    });
  }

  return subscriptions.length;
}

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a test user
  const user = await db.user.upsert({
    where: { email: "demo@churnsentinel.com" },
    update: {},
    create: {
      email: "demo@churnsentinel.com",
      name: "Demo User",
      emailVerified: new Date(),
    },
  });
  console.log("Created user:", user.email);

  // Create a workspace
  const workspace = await db.workspace.upsert({
    where: { id: "demo-workspace" },
    update: {},
    create: {
      id: "demo-workspace",
      name: "Demo Company",
      members: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
      alertSettings: {
        create: {
          riskThreshold: 50,
          alertOnPaymentFailed: true,
          alertOnCancelPending: true,
          alertOnCancellation: true,
          weeklyReportEnabled: true,
        },
      },
    },
  });
  console.log("Created workspace:", workspace.name);

  // Create demo customers
  const customers = [
    { id: "cust_healthy1", email: "healthy1@example.com", name: "Acme Corp" },
    { id: "cust_healthy2", email: "healthy2@example.com", name: "TechStart Inc" },
    { id: "cust_atrisk1", email: "atrisk1@example.com", name: "Risky Business LLC" },
    { id: "cust_atrisk2", email: "atrisk2@example.com", name: "Churning Co" },
    { id: "cust_pastdue", email: "pastdue@example.com", name: "Late Payers Ltd" },
  ];

  for (const cust of customers) {
    await db.customer.upsert({
      where: {
        workspaceId_stripeCustomerId: {
          workspaceId: workspace.id,
          stripeCustomerId: cust.id,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        stripeCustomerId: cust.id,
        email: cust.email,
        name: cust.name,
      },
    });
  }
  console.log("Created", customers.length, "customers");

  // Create subscriptions
  const dbCustomers = await db.customer.findMany({
    where: { workspaceId: workspace.id },
  });

  const plans = [
    { name: "Starter", amount: 2900 },
    { name: "Pro", amount: 9900 },
    { name: "Enterprise", amount: 29900 },
  ];

  for (const customer of dbCustomers) {
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const isAtRisk = customer.stripeCustomerId.includes("atrisk");
    const isPastDue = customer.stripeCustomerId.includes("pastdue");

    await db.subscription.upsert({
      where: {
        workspaceId_stripeSubscriptionId: {
          workspaceId: workspace.id,
          stripeSubscriptionId: `sub_${customer.stripeCustomerId}`,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        customerId: customer.id,
        stripeSubscriptionId: `sub_${customer.stripeCustomerId}`,
        status: isPastDue ? "past_due" : "active",
        planId: `price_${plan.name.toLowerCase()}`,
        planName: plan.name,
        planAmount: plan.amount,
        cancelAtPeriodEnd: isAtRisk,
        currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        previousPlanAmount: isAtRisk ? plan.amount + 5000 : null,
      },
    });
  }
  console.log("Created subscriptions");

  // Create invoice events for at-risk customers
  const now = new Date();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const atRiskCustomers = dbCustomers.filter(
    (c) =>
      c.stripeCustomerId.includes("atrisk") ||
      c.stripeCustomerId.includes("pastdue")
  );

  let eventCount = 0;
  for (const customer of atRiskCustomers) {
    // Add payment failures
    await db.invoiceEvent.upsert({
      where: {
        workspaceId_stripeEventId: {
          workspaceId: workspace.id,
          stripeEventId: `evt_fail1_${customer.stripeCustomerId}`,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        stripeEventId: `evt_fail1_${customer.stripeCustomerId}`,
        stripeCustomerId: customer.stripeCustomerId,
        stripeInvoiceId: `in_${customer.stripeCustomerId}_1`,
        type: "invoice.payment_failed",
        payload: { reason: "card_declined" },
        createdAt: fiveDaysAgo,
      },
    });

    await db.invoiceEvent.upsert({
      where: {
        workspaceId_stripeEventId: {
          workspaceId: workspace.id,
          stripeEventId: `evt_fail2_${customer.stripeCustomerId}`,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        stripeEventId: `evt_fail2_${customer.stripeCustomerId}`,
        stripeCustomerId: customer.stripeCustomerId,
        stripeInvoiceId: `in_${customer.stripeCustomerId}_2`,
        type: "invoice.payment_failed",
        payload: { reason: "insufficient_funds" },
        createdAt: tenDaysAgo,
      },
    });
    eventCount += 2;
  }
  console.log("Created", eventCount, "invoice events");

  // Calculate risk scores
  console.log("Calculating risk scores...");
  const { recomputeAllRisksForWorkspace } = await import("../src/lib/risk-scoring");
  const updated = await recomputeAllRisksForWorkspace(workspace.id);
  console.log("Updated risk scores for", updated, "customers");

  console.log("\nSeeding complete!");
  console.log("\nDemo login: demo@churnsentinel.com");
  console.log("(Use magic link - check console for the link in dev mode)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

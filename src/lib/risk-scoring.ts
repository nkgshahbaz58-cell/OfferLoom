import { db } from "./db";

export interface RiskReason {
  rule: string;
  points: number;
  detail: string;
}

export interface RiskAssessmentResult {
  score: number;
  reasons: RiskReason[];
}

interface CustomerRiskData {
  customerId: string;
  subscriptions: {
    cancelAtPeriodEnd: boolean;
    planAmount: number | null;
    previousPlanAmount: number | null;
    updatedAt: Date;
  }[];
  invoiceEvents: {
    type: string;
    createdAt: Date;
  }[];
}

export function calculateRiskScore(data: CustomerRiskData): RiskAssessmentResult {
  const reasons: RiskReason[] = [];
  let score = 0;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Rule 1: +40 if invoice payment failed in last 7 days
  const recentPaymentFailures = data.invoiceEvents.filter(
    (e) => e.type === "invoice.payment_failed" && e.createdAt >= sevenDaysAgo
  );
  if (recentPaymentFailures.length > 0) {
    score += 40;
    reasons.push({
      rule: "recent_payment_failure",
      points: 40,
      detail: `Payment failed within last 7 days (${recentPaymentFailures.length} failure${recentPaymentFailures.length > 1 ? "s" : ""})`,
    });
  }

  // Rule 2: +30 if subscription set to cancel_at_period_end
  const cancelingSubscriptions = data.subscriptions.filter(
    (s) => s.cancelAtPeriodEnd
  );
  if (cancelingSubscriptions.length > 0) {
    score += 30;
    reasons.push({
      rule: "cancel_at_period_end",
      points: 30,
      detail: `${cancelingSubscriptions.length} subscription${cancelingSubscriptions.length > 1 ? "s" : ""} set to cancel at period end`,
    });
  }

  // Rule 3: +20 if customer had 2+ payment failures in 30 days
  const monthlyPaymentFailures = data.invoiceEvents.filter(
    (e) => e.type === "invoice.payment_failed" && e.createdAt >= thirtyDaysAgo
  );
  if (monthlyPaymentFailures.length >= 2) {
    score += 20;
    reasons.push({
      rule: "multiple_payment_failures",
      points: 20,
      detail: `${monthlyPaymentFailures.length} payment failures in the last 30 days`,
    });
  }

  // Rule 4: +10 if downgraded plan in last 30 days
  const downgradedSubscriptions = data.subscriptions.filter((s) => {
    if (!s.previousPlanAmount || !s.planAmount) return false;
    if (s.updatedAt < thirtyDaysAgo) return false;
    return s.planAmount < s.previousPlanAmount;
  });
  if (downgradedSubscriptions.length > 0) {
    score += 10;
    reasons.push({
      rule: "recent_downgrade",
      points: 10,
      detail: `Downgraded subscription plan in the last 30 days`,
    });
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return { score, reasons };
}

export async function computeRiskForCustomer(customerId: string): Promise<RiskAssessmentResult> {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      subscriptions: {
        select: {
          cancelAtPeriodEnd: true,
          planAmount: true,
          previousPlanAmount: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }

  const invoiceEvents = await db.invoiceEvent.findMany({
    where: {
      workspaceId: customer.workspaceId,
      stripeCustomerId: customer.stripeCustomerId,
      type: { in: ["invoice.payment_failed", "invoice.paid"] },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      type: true,
      createdAt: true,
    },
  });

  const riskData: CustomerRiskData = {
    customerId: customer.id,
    subscriptions: customer.subscriptions,
    invoiceEvents,
  };

  return calculateRiskScore(riskData);
}

export async function updateRiskAssessment(customerId: string): Promise<void> {
  const result = await computeRiskForCustomer(customerId);

  await db.riskAssessment.upsert({
    where: { customerId },
    create: {
      customerId,
      score: result.score,
      reasons: result.reasons,
    },
    update: {
      score: result.score,
      reasons: result.reasons,
    },
  });
}

export async function recomputeAllRisksForWorkspace(workspaceId: string): Promise<number> {
  const customers = await db.customer.findMany({
    where: { workspaceId },
    select: { id: true },
  });

  let updated = 0;
  for (const customer of customers) {
    try {
      await updateRiskAssessment(customer.id);
      updated++;
    } catch {
      console.error(`Failed to update risk for customer ${customer.id}`);
    }
  }

  return updated;
}

import { describe, it, expect } from "vitest";
import { calculateRiskScore, type RiskAssessmentResult } from "../src/lib/risk-scoring";

describe("Risk Scoring", () => {
  const now = new Date();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

  it("should return 0 score for healthy customer", () => {
    const result = calculateRiskScore({
      customerId: "cust_1",
      subscriptions: [
        {
          cancelAtPeriodEnd: false,
          planAmount: 2900,
          previousPlanAmount: null,
          updatedAt: tenDaysAgo,
        },
      ],
      invoiceEvents: [],
    });

    expect(result.score).toBe(0);
    expect(result.reasons).toHaveLength(0);
  });

  it("should add 40 points for recent payment failure (within 7 days)", () => {
    const result = calculateRiskScore({
      customerId: "cust_2",
      subscriptions: [],
      invoiceEvents: [
        { type: "invoice.payment_failed", createdAt: fiveDaysAgo },
      ],
    });

    expect(result.score).toBe(40);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0].rule).toBe("recent_payment_failure");
    expect(result.reasons[0].points).toBe(40);
  });

  it("should NOT add points for payment failure older than 7 days", () => {
    const result = calculateRiskScore({
      customerId: "cust_3",
      subscriptions: [],
      invoiceEvents: [
        { type: "invoice.payment_failed", createdAt: tenDaysAgo },
      ],
    });

    expect(result.score).toBe(0);
    expect(result.reasons).toHaveLength(0);
  });

  it("should add 30 points for subscription set to cancel at period end", () => {
    const result = calculateRiskScore({
      customerId: "cust_4",
      subscriptions: [
        {
          cancelAtPeriodEnd: true,
          planAmount: 2900,
          previousPlanAmount: null,
          updatedAt: now,
        },
      ],
      invoiceEvents: [],
    });

    expect(result.score).toBe(30);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0].rule).toBe("cancel_at_period_end");
  });

  it("should add 20 points for 2+ payment failures in 30 days", () => {
    const result = calculateRiskScore({
      customerId: "cust_5",
      subscriptions: [],
      invoiceEvents: [
        { type: "invoice.payment_failed", createdAt: tenDaysAgo },
        { type: "invoice.payment_failed", createdAt: fifteenDaysAgo },
      ],
    });

    expect(result.score).toBe(20);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0].rule).toBe("multiple_payment_failures");
  });

  it("should NOT add points for payment failures older than 30 days", () => {
    const result = calculateRiskScore({
      customerId: "cust_6",
      subscriptions: [],
      invoiceEvents: [
        { type: "invoice.payment_failed", createdAt: fortyDaysAgo },
        { type: "invoice.payment_failed", createdAt: fortyDaysAgo },
      ],
    });

    expect(result.score).toBe(0);
    expect(result.reasons).toHaveLength(0);
  });

  it("should add 10 points for recent downgrade", () => {
    const result = calculateRiskScore({
      customerId: "cust_7",
      subscriptions: [
        {
          cancelAtPeriodEnd: false,
          planAmount: 1900,
          previousPlanAmount: 2900,
          updatedAt: fiveDaysAgo,
        },
      ],
      invoiceEvents: [],
    });

    expect(result.score).toBe(10);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0].rule).toBe("recent_downgrade");
  });

  it("should NOT add points for upgrade", () => {
    const result = calculateRiskScore({
      customerId: "cust_8",
      subscriptions: [
        {
          cancelAtPeriodEnd: false,
          planAmount: 4900,
          previousPlanAmount: 2900,
          updatedAt: fiveDaysAgo,
        },
      ],
      invoiceEvents: [],
    });

    expect(result.score).toBe(0);
    expect(result.reasons).toHaveLength(0);
  });

  it("should combine multiple risk factors", () => {
    const result = calculateRiskScore({
      customerId: "cust_9",
      subscriptions: [
        {
          cancelAtPeriodEnd: true,
          planAmount: 1900,
          previousPlanAmount: 2900,
          updatedAt: fiveDaysAgo,
        },
      ],
      invoiceEvents: [
        { type: "invoice.payment_failed", createdAt: fiveDaysAgo },
        { type: "invoice.payment_failed", createdAt: tenDaysAgo },
      ],
    });

    // +40 (recent failure) + +30 (cancel at period end) + +20 (multiple failures) + +10 (downgrade) = 100
    expect(result.score).toBe(100);
    expect(result.reasons).toHaveLength(4);
  });

  it("should cap score at 100", () => {
    // Even with more factors, score should not exceed 100
    const result = calculateRiskScore({
      customerId: "cust_10",
      subscriptions: [
        {
          cancelAtPeriodEnd: true,
          planAmount: 1900,
          previousPlanAmount: 2900,
          updatedAt: fiveDaysAgo,
        },
        {
          cancelAtPeriodEnd: true,
          planAmount: 900,
          previousPlanAmount: 1900,
          updatedAt: fiveDaysAgo,
        },
      ],
      invoiceEvents: [
        { type: "invoice.payment_failed", createdAt: fiveDaysAgo },
        { type: "invoice.payment_failed", createdAt: fiveDaysAgo },
        { type: "invoice.payment_failed", createdAt: tenDaysAgo },
      ],
    });

    expect(result.score).toBe(100);
  });

  it("should provide detailed reasons for each risk factor", () => {
    const result = calculateRiskScore({
      customerId: "cust_11",
      subscriptions: [
        {
          cancelAtPeriodEnd: true,
          planAmount: 1900,
          previousPlanAmount: null,
          updatedAt: fiveDaysAgo,
        },
      ],
      invoiceEvents: [
        { type: "invoice.payment_failed", createdAt: fiveDaysAgo },
      ],
    });

    expect(result.reasons).toHaveLength(2);
    result.reasons.forEach((reason) => {
      expect(reason).toHaveProperty("rule");
      expect(reason).toHaveProperty("points");
      expect(reason).toHaveProperty("detail");
      expect(reason.detail.length).toBeGreaterThan(0);
    });
  });
});

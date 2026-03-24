import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;

    const [subscriptions, customers, atRiskCount, recentCancellations] =
      await Promise.all([
        db.subscription.findMany({ where: { workspaceId } }),
        db.customer.count({ where: { workspaceId } }),
        db.riskAssessment.count({
          where: {
            score: { gte: 50 },
            customer: { workspaceId },
          },
        }),
        db.subscription.count({
          where: {
            workspaceId,
            status: "canceled",
            canceledAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    const activeSubscriptions = subscriptions.filter((s) =>
      ["active", "trialing"].includes(s.status)
    );
    const trials = subscriptions.filter((s) => s.status === "trialing");
    const pastDue = subscriptions.filter((s) => s.status === "past_due");

    const mrr = activeSubscriptions.reduce(
      (sum, s) => sum + (s.planAmount || 0),
      0
    );

    return NextResponse.json({
      mrr,
      activeSubscriptions: activeSubscriptions.length,
      trials: trials.length,
      pastDue: pastDue.length,
      cancellations: recentCancellations,
      atRiskCustomers: atRiskCount,
      totalCustomers: customers,
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

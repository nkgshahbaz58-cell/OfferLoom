import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripeClient, syncStripeCustomers, syncStripeSubscriptions } from "@/lib/stripe";
import { recomputeAllRisksForWorkspace } from "@/lib/risk-scoring";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { secretKey, webhookSecret } = await request.json();

    if (!secretKey || !secretKey.startsWith("sk_")) {
      return NextResponse.json(
        { error: "Invalid Stripe secret key format" },
        { status: 400 }
      );
    }

    // Verify the key works by fetching account info
    const stripe = getStripeClient(secretKey);
    try {
      await stripe.accounts.retrieve();
    } catch {
      return NextResponse.json(
        { error: "Invalid Stripe API key" },
        { status: 400 }
      );
    }

    // Save the connection
    await db.stripeConnection.upsert({
      where: { workspaceId: session.user.workspaceId },
      create: {
        workspaceId: session.user.workspaceId,
        stripeSecretKey: secretKey,
        stripeWebhookSecret: webhookSecret || null,
      },
      update: {
        stripeSecretKey: secretKey,
        stripeWebhookSecret: webhookSecret || null,
      },
    });

    // Sync customers and subscriptions
    const customersCount = await syncStripeCustomers(
      stripe,
      session.user.workspaceId,
      db
    );
    const subscriptionsCount = await syncStripeSubscriptions(
      stripe,
      session.user.workspaceId,
      db
    );

    // Compute initial risk scores
    await recomputeAllRisksForWorkspace(session.user.workspaceId);

    return NextResponse.json({
      success: true,
      synced: {
        customers: customersCount,
        subscriptions: subscriptionsCount,
      },
    });
  } catch (error) {
    console.error("Stripe connect error:", error);
    return NextResponse.json(
      { error: "Failed to connect Stripe" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { updateRiskAssessment } from "@/lib/risk-scoring";
import { sendAlert } from "@/lib/alerts";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // Get the workspace from the webhook endpoint URL or find by event
  // For MVP, we'll look up by customer ID in the event
  let event: Stripe.Event;

  try {
    // First, try to parse the event without verification for workspace lookup
    const rawEvent = JSON.parse(body) as Stripe.Event;
    const customerId = getCustomerIdFromEvent(rawEvent);

    if (!customerId) {
      console.log("Event without customer ID:", rawEvent.type);
      return NextResponse.json({ received: true });
    }

    // Find the workspace by customer
    const customer = await db.customer.findFirst({
      where: { stripeCustomerId: customerId },
      include: {
        workspace: {
          include: { stripeConnection: true },
        },
      },
    });

    if (!customer?.workspace?.stripeConnection) {
      // Try to find by scanning all connections
      const connections = await db.stripeConnection.findMany();
      let foundWorkspace = null;

      for (const conn of connections) {
        const stripe = new Stripe(conn.stripeSecretKey, {
          apiVersion: "2024-06-20",
        });

        try {
          // Verify signature with this workspace's secret
          if (conn.stripeWebhookSecret) {
            event = stripe.webhooks.constructEvent(
              body,
              signature,
              conn.stripeWebhookSecret
            );
            foundWorkspace = conn.workspaceId;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!foundWorkspace) {
        // Process without verification for MVP
        event = rawEvent;
      } else {
        // Process with the found workspace
        await processWebhookEvent(event!, foundWorkspace);
        return NextResponse.json({ received: true });
      }
    } else {
      // Verify with workspace's webhook secret
      const conn = customer.workspace.stripeConnection;
      if (conn.stripeWebhookSecret) {
        const stripe = new Stripe(conn.stripeSecretKey, {
          apiVersion: "2024-06-20",
        });
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          conn.stripeWebhookSecret
        );
      } else {
        event = rawEvent;
      }

      await processWebhookEvent(event, customer.workspaceId);
      return NextResponse.json({ received: true });
    }

    // If we get here, process without workspace match
    console.log("Could not match event to workspace:", rawEvent.type);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

function getCustomerIdFromEvent(event: Stripe.Event): string | null {
  const obj = event.data.object as Record<string, unknown>;

  if ("customer" in obj && typeof obj.customer === "string") {
    return obj.customer;
  }
  if ("id" in obj && event.type.startsWith("customer.")) {
    return obj.id as string;
  }
  return null;
}

async function processWebhookEvent(event: Stripe.Event, workspaceId: string) {
  const customerId = getCustomerIdFromEvent(event);

  // Store the event
  await db.invoiceEvent.upsert({
    where: {
      workspaceId_stripeEventId: {
        workspaceId,
        stripeEventId: event.id,
      },
    },
    create: {
      workspaceId,
      stripeEventId: event.id,
      stripeCustomerId: customerId,
      stripeInvoiceId:
        event.type.includes("invoice") && "id" in event.data.object
          ? (event.data.object as { id: string }).id
          : null,
      type: event.type,
      payload: event.data.object as object,
    },
    update: {},
  });

  // Handle specific event types
  switch (event.type) {
    case "customer.created":
    case "customer.updated": {
      const customer = event.data.object as Stripe.Customer;
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
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const dbCustomer = await db.customer.findUnique({
        where: {
          workspaceId_stripeCustomerId: {
            workspaceId,
            stripeCustomerId: subscription.customer as string,
          },
        },
      });

      if (dbCustomer) {
        const planItem = subscription.items.data[0];
        const price = planItem?.price;

        // Get previous amount for downgrade detection
        const existingSub = await db.subscription.findUnique({
          where: {
            workspaceId_stripeSubscriptionId: {
              workspaceId,
              stripeSubscriptionId: subscription.id,
            },
          },
        });

        await db.subscription.upsert({
          where: {
            workspaceId_stripeSubscriptionId: {
              workspaceId,
              stripeSubscriptionId: subscription.id,
            },
          },
          create: {
            workspaceId,
            customerId: dbCustomer.id,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            planId: price?.id,
            planName: price?.nickname,
            planAmount: price?.unit_amount,
            currency: price?.currency || "usd",
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          update: {
            status: subscription.status,
            planId: price?.id,
            planName: price?.nickname,
            planAmount: price?.unit_amount,
            previousPlanAmount: existingSub?.planAmount,
            currency: price?.currency || "usd",
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Update risk and send alerts
        await updateRiskAssessment(dbCustomer.id);

        if (subscription.cancel_at_period_end) {
          await sendAlert(workspaceId, {
            type: "cancel_pending",
            customerName: dbCustomer.name || undefined,
            customerEmail: dbCustomer.email || undefined,
            customerId: dbCustomer.id,
            details: "Subscription set to cancel at period end",
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const dbCustomer = await db.customer.findUnique({
        where: {
          workspaceId_stripeCustomerId: {
            workspaceId,
            stripeCustomerId: subscription.customer as string,
          },
        },
      });

      if (dbCustomer) {
        await db.subscription.update({
          where: {
            workspaceId_stripeSubscriptionId: {
              workspaceId,
              stripeSubscriptionId: subscription.id,
            },
          },
          data: {
            status: "canceled",
            canceledAt: new Date(),
          },
        });

        await updateRiskAssessment(dbCustomer.id);

        await sendAlert(workspaceId, {
          type: "cancellation",
          customerName: dbCustomer.name || undefined,
          customerEmail: dbCustomer.email || undefined,
          customerId: dbCustomer.id,
          details: "Subscription has been cancelled",
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const dbCustomer = await db.customer.findFirst({
        where: {
          workspaceId,
          stripeCustomerId: invoice.customer as string,
        },
      });

      if (dbCustomer) {
        await updateRiskAssessment(dbCustomer.id);

        const riskAssessment = await db.riskAssessment.findUnique({
          where: { customerId: dbCustomer.id },
        });

        await sendAlert(workspaceId, {
          type: "payment_failed",
          customerName: dbCustomer.name || undefined,
          customerEmail: dbCustomer.email || undefined,
          customerId: dbCustomer.id,
          riskScore: riskAssessment?.score,
          details: `Invoice payment failed: ${invoice.id}`,
        });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const dbCustomer = await db.customer.findFirst({
        where: {
          workspaceId,
          stripeCustomerId: invoice.customer as string,
        },
      });

      if (dbCustomer) {
        await updateRiskAssessment(dbCustomer.id);
      }
      break;
    }
  }
}

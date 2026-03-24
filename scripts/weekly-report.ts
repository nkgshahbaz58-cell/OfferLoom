/**
 * Weekly Report Script
 *
 * This script generates and sends weekly churn risk reports.
 * Run via: pnpm tsx scripts/weekly-report.ts
 * Or via GitHub Actions cron schedule.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

interface WorkspaceReport {
  workspaceId: string;
  workspaceName: string;
  totalMRR: number;
  mrrAtRisk: number;
  atRiskCustomers: {
    name: string;
    email: string;
    mrr: number;
    riskScore: number;
  }[];
  recentCancellations: number;
  recentPaymentFailures: number;
}

async function generateReport(workspaceId: string): Promise<WorkspaceReport | null> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: { alertSettings: true },
  });

  if (!workspace || !workspace.alertSettings?.weeklyReportEnabled) {
    return null;
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get subscriptions
  const subscriptions = await db.subscription.findMany({
    where: {
      workspaceId,
      status: { in: ["active", "trialing", "past_due"] },
    },
  });

  const totalMRR = subscriptions.reduce((sum, s) => sum + (s.planAmount || 0), 0);

  // Get at-risk customers
  const atRiskCustomers = await db.customer.findMany({
    where: {
      workspaceId,
      riskAssessment: {
        score: { gte: 50 },
      },
    },
    include: {
      riskAssessment: true,
      subscriptions: {
        where: { status: { in: ["active", "trialing", "past_due"] } },
      },
    },
    orderBy: {
      riskAssessment: { score: "desc" },
    },
    take: 10,
  });

  const mrrAtRisk = atRiskCustomers.reduce(
    (sum, c) => sum + c.subscriptions.reduce((s, sub) => s + (sub.planAmount || 0), 0),
    0
  );

  // Count events
  const [cancellations, paymentFailures] = await Promise.all([
    db.subscription.count({
      where: {
        workspaceId,
        status: "canceled",
        canceledAt: { gte: sevenDaysAgo },
      },
    }),
    db.invoiceEvent.count({
      where: {
        workspaceId,
        type: "invoice.payment_failed",
        createdAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  return {
    workspaceId,
    workspaceName: workspace.name,
    totalMRR,
    mrrAtRisk,
    atRiskCustomers: atRiskCustomers.map((c) => ({
      name: c.name || "Unknown",
      email: c.email || "",
      mrr: c.subscriptions.reduce((s, sub) => s + (sub.planAmount || 0), 0),
      riskScore: c.riskAssessment?.score || 0,
    })),
    recentCancellations: cancellations,
    recentPaymentFailures: paymentFailures,
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

async function sendSlackReport(webhookUrl: string, report: WorkspaceReport) {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Weekly Revenue Risk Report",
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Total MRR:*\n${formatCurrency(report.totalMRR)}` },
        { type: "mrkdwn", text: `*MRR at Risk:*\n${formatCurrency(report.mrrAtRisk)}` },
        { type: "mrkdwn", text: `*Cancellations (7d):*\n${report.recentCancellations}` },
        { type: "mrkdwn", text: `*Payment Failures (7d):*\n${report.recentPaymentFailures}` },
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Top At-Risk Customers (${report.atRiskCustomers.length}):*`,
      },
    },
  ];

  for (const customer of report.atRiskCustomers.slice(0, 5)) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `- *${customer.name}* (${customer.email})\n  MRR: ${formatCurrency(customer.mrr)} | Risk: ${customer.riskScore}/100`,
      },
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `ChurnSentinel Weekly Report | ${new Date().toISOString().split("T")[0]}`,
      },
    ],
  });

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });
}

async function sendEmailReport(recipients: string[], report: WorkspaceReport) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1f2937;">Weekly Revenue Risk Report</h1>
      <p style="color: #6b7280;">ChurnSentinel report for ${report.workspaceName}</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
          <p style="color: #6b7280; margin: 0 0 4px 0;">Total MRR</p>
          <p style="font-size: 24px; font-weight: bold; margin: 0;">${formatCurrency(report.totalMRR)}</p>
        </div>
        <div style="background: #fef2f2; padding: 16px; border-radius: 8px;">
          <p style="color: #dc2626; margin: 0 0 4px 0;">MRR at Risk</p>
          <p style="font-size: 24px; font-weight: bold; margin: 0; color: #dc2626;">${formatCurrency(report.mrrAtRisk)}</p>
        </div>
      </div>

      <div style="margin: 24px 0;">
        <p><strong>Cancellations (7d):</strong> ${report.recentCancellations}</p>
        <p><strong>Payment Failures (7d):</strong> ${report.recentPaymentFailures}</p>
      </div>

      <h2 style="color: #1f2937;">Top At-Risk Customers</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f3f4f6;">
          <th style="text-align: left; padding: 8px;">Customer</th>
          <th style="text-align: right; padding: 8px;">MRR</th>
          <th style="text-align: right; padding: 8px;">Risk</th>
        </tr>
        ${report.atRiskCustomers
          .slice(0, 10)
          .map(
            (c) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
              ${c.name}<br><span style="color: #6b7280;">${c.email}</span>
            </td>
            <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatCurrency(c.mrr)}</td>
            <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">
              <span style="background: ${c.riskScore >= 70 ? "#fecaca" : c.riskScore >= 50 ? "#fed7aa" : "#fef08a"}; padding: 2px 8px; border-radius: 4px;">
                ${c.riskScore}
              </span>
            </td>
          </tr>
        `
          )
          .join("")}
      </table>

      <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
        This report was generated by ChurnSentinel on ${new Date().toISOString()}
      </p>
    </div>
  `;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "reports@churnsentinel.com",
    to: recipients,
    subject: `[ChurnSentinel] Weekly Revenue Risk Report - ${formatCurrency(report.mrrAtRisk)} at risk`,
    html,
  });
}

async function main() {
  console.log("Generating weekly reports...");

  const workspaces = await db.workspace.findMany({
    include: { alertSettings: true },
  });

  for (const workspace of workspaces) {
    console.log(`Processing workspace: ${workspace.name}`);

    const report = await generateReport(workspace.id);
    if (!report) {
      console.log("  Skipped (reports disabled)");
      continue;
    }

    console.log(`  Total MRR: ${formatCurrency(report.totalMRR)}`);
    console.log(`  MRR at Risk: ${formatCurrency(report.mrrAtRisk)}`);
    console.log(`  At-risk customers: ${report.atRiskCustomers.length}`);

    // Send Slack report
    if (workspace.alertSettings?.slackWebhookUrl) {
      try {
        await sendSlackReport(workspace.alertSettings.slackWebhookUrl, report);
        console.log("  Sent Slack report");
      } catch (error) {
        console.error("  Failed to send Slack report:", error);
      }
    }

    // Send email report
    if (workspace.alertSettings?.emailRecipients.length) {
      try {
        await sendEmailReport(workspace.alertSettings.emailRecipients, report);
        console.log("  Sent email report");
      } catch (error) {
        console.error("  Failed to send email report:", error);
      }
    }
  }

  console.log("Weekly reports complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

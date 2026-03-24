import { Resend } from "resend";
import { db } from "./db";

interface AlertPayload {
  type: "payment_failed" | "cancel_pending" | "cancellation" | "risk_threshold" | "test";
  customerName?: string;
  customerEmail?: string;
  customerId?: string;
  details?: string;
  riskScore?: number;
}

export async function sendSlackAlert(
  webhookUrl: string,
  payload: AlertPayload
): Promise<boolean> {
  const emoji = {
    payment_failed: ":warning:",
    cancel_pending: ":hourglass:",
    cancellation: ":x:",
    risk_threshold: ":rotating_light:",
    test: ":test_tube:",
  }[payload.type];

  const title = {
    payment_failed: "Payment Failed",
    cancel_pending: "Subscription Cancellation Pending",
    cancellation: "Subscription Cancelled",
    risk_threshold: "Risk Threshold Exceeded",
    test: "Test Alert",
  }[payload.type];

  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${emoji} ${title}`,
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Customer:*\n${payload.customerName || "N/A"}`,
          },
          {
            type: "mrkdwn",
            text: `*Email:*\n${payload.customerEmail || "N/A"}`,
          },
        ],
      },
      ...(payload.riskScore !== undefined
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Risk Score:* ${payload.riskScore}/100`,
              },
            },
          ]
        : []),
      ...(payload.details
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Details:*\n${payload.details}`,
              },
            },
          ]
        : []),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `ChurnSentinel Alert | ${new Date().toISOString()}`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send Slack alert:", error);
    return false;
  }
}

export async function sendEmailAlert(
  recipients: string[],
  payload: AlertPayload
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  const resend = new Resend(apiKey);

  const title = {
    payment_failed: "Payment Failed Alert",
    cancel_pending: "Subscription Cancellation Pending",
    cancellation: "Subscription Cancelled",
    risk_threshold: "Risk Threshold Exceeded",
    test: "Test Alert from ChurnSentinel",
  }[payload.type];

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ef4444;">${title}</h1>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Customer:</strong> ${payload.customerName || "N/A"}</p>
        <p><strong>Email:</strong> ${payload.customerEmail || "N/A"}</p>
        ${payload.riskScore !== undefined ? `<p><strong>Risk Score:</strong> ${payload.riskScore}/100</p>` : ""}
        ${payload.details ? `<p><strong>Details:</strong> ${payload.details}</p>` : ""}
      </div>
      <p style="color: #6b7280; font-size: 12px;">
        This alert was sent by ChurnSentinel at ${new Date().toISOString()}
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "alerts@churnsentinel.com",
      to: recipients,
      subject: `[ChurnSentinel] ${title}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email alert:", error);
    return false;
  }
}

export async function sendAlert(
  workspaceId: string,
  payload: AlertPayload
): Promise<{ slack: boolean; email: boolean }> {
  const settings = await db.alertSettings.findUnique({
    where: { workspaceId },
  });

  if (!settings) {
    return { slack: false, email: false };
  }

  // Check if this alert type is enabled
  const shouldSend = {
    payment_failed: settings.alertOnPaymentFailed,
    cancel_pending: settings.alertOnCancelPending,
    cancellation: settings.alertOnCancellation,
    risk_threshold: true,
    test: true,
  }[payload.type];

  if (!shouldSend) {
    return { slack: false, email: false };
  }

  const results = { slack: false, email: false };

  if (settings.slackWebhookUrl) {
    results.slack = await sendSlackAlert(settings.slackWebhookUrl, payload);
  }

  if (settings.emailRecipients.length > 0) {
    results.email = await sendEmailAlert(settings.emailRecipients, payload);
  }

  return results;
}

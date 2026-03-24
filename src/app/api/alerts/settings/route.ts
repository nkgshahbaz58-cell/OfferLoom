import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  slackWebhookUrl: z.string().url().nullable().optional(),
  emailRecipients: z.array(z.string().email()).optional(),
  riskThreshold: z.number().min(0).max(100).optional(),
  alertOnPaymentFailed: z.boolean().optional(),
  alertOnCancelPending: z.boolean().optional(),
  alertOnCancellation: z.boolean().optional(),
  weeklyReportEnabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.alertSettings.findUnique({
      where: { workspaceId: session.user.workspaceId },
    });

    return NextResponse.json(settings || {});
  } catch (error) {
    console.error("Get alert settings error:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const settings = await db.alertSettings.upsert({
      where: { workspaceId: session.user.workspaceId },
      create: {
        workspaceId: session.user.workspaceId,
        ...data,
      },
      update: data,
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Update alert settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

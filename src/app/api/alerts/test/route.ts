import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { sendAlert } from "@/lib/alerts";

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendAlert(session.user.workspaceId, {
      type: "test",
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      details: "This is a test alert from ChurnSentinel",
      riskScore: 75,
    });

    return NextResponse.json({
      success: true,
      sent: result,
    });
  } catch (error) {
    console.error("Test alert error:", error);
    return NextResponse.json(
      { error: "Failed to send test alert" },
      { status: 500 }
    );
  }
}

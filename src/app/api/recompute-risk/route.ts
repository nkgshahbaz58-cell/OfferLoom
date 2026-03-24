import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { recomputeAllRisksForWorkspace } from "@/lib/risk-scoring";

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await recomputeAllRisksForWorkspace(
      session.user.workspaceId
    );

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error) {
    console.error("Recompute risk error:", error);
    return NextResponse.json(
      { error: "Failed to recompute risks" },
      { status: 500 }
    );
  }
}

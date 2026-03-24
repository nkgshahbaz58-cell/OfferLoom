import { redirect } from "next/navigation";

export default async function Home() {
  // Check if required environment variables are set
  const isDatabaseConfigured = !!process.env.DATABASE_URL;
  const isAuthConfigured = !!process.env.NEXTAUTH_SECRET;

  if (!isDatabaseConfigured || !isAuthConfigured) {
    redirect("/setup");
  }

  // Try to get session only if env vars are configured
  try {
    const { getAuthSession } = await import("@/lib/auth");
    const session = await getAuthSession();

    if (session) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  } catch (error) {
    console.error("Auth error:", error);
    redirect("/setup");
  }
}

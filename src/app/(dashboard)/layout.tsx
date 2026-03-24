import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={session.user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

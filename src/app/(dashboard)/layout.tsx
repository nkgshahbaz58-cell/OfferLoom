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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <DashboardNav user={session.user} />
      {/* Main content area */}
      <main className="lg:pl-72">
        {/* Mobile spacing */}
        <div className="lg:hidden h-28" />
        <div className="p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

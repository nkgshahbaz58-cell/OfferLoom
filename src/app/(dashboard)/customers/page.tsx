import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, getRiskColor, getRiskLevel } from "@/lib/utils";
import { Users, ArrowRight, Search } from "lucide-react";

async function getCustomers(workspaceId: string) {
  return db.customer.findMany({
    where: { workspaceId },
    include: {
      riskAssessment: true,
      subscriptions: {
        where: { status: { in: ["active", "past_due", "trialing"] } },
      },
    },
    orderBy: [
      { riskAssessment: { score: "desc" } },
      { createdAt: "desc" },
    ],
  });
}

export default async function CustomersPage() {
  const session = await getAuthSession();
  if (!session?.user?.workspaceId) {
    redirect("/login");
  }

  const customers = await getCustomers(session.user.workspaceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            {customers.length} total customers
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Customers
              </CardTitle>
              <CardDescription>
                Click on a customer to view details and risk breakdown
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-9"
                disabled
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3" />
              <p className="font-medium">No customers yet</p>
              <p className="text-sm">
                Customers will appear here once synced from Stripe
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => {
                const mrr = customer.subscriptions.reduce(
                  (sum, s) => sum + (s.planAmount || 0),
                  0
                );
                const riskScore = customer.riskAssessment?.score || 0;
                const status = customer.subscriptions[0]?.status || "no_sub";

                return (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getRiskColor(riskScore)}`}
                      >
                        {riskScore}
                      </div>
                      <div>
                        <p className="font-medium">
                          {customer.name || customer.email || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(mrr)}/mo</p>
                        <Badge
                          variant={
                            status === "active"
                              ? "success"
                              : status === "past_due"
                                ? "destructive"
                                : status === "trialing"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Badge
                        variant={
                          getRiskLevel(riskScore) === "critical"
                            ? "destructive"
                            : getRiskLevel(riskScore) === "high"
                              ? "warning"
                              : getRiskLevel(riskScore) === "medium"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {getRiskLevel(riskScore)} risk
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

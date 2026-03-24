import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getRiskColor, getRiskLevel } from "@/lib/utils";
import {
  DollarSign,
  Users,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingDown,
  Zap,
  ArrowRight,
} from "lucide-react";

async function getDashboardData(workspaceId: string) {
  const [
    subscriptions,
    customers,
    atRiskCustomers,
    recentCancellations,
    stripeConnection,
  ] = await Promise.all([
    db.subscription.findMany({
      where: { workspaceId },
    }),
    db.customer.count({ where: { workspaceId } }),
    db.customer.findMany({
      where: {
        workspaceId,
        riskAssessment: {
          score: { gte: 30 },
        },
      },
      include: {
        riskAssessment: true,
        subscriptions: {
          where: { status: { in: ["active", "past_due", "trialing"] } },
        },
      },
      orderBy: {
        riskAssessment: { score: "desc" },
      },
      take: 10,
    }),
    db.subscription.count({
      where: {
        workspaceId,
        status: "canceled",
        canceledAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    db.stripeConnection.findUnique({ where: { workspaceId } }),
  ]);

  const activeSubscriptions = subscriptions.filter((s) =>
    ["active", "trialing"].includes(s.status)
  );
  const trials = subscriptions.filter((s) => s.status === "trialing");
  const pastDue = subscriptions.filter((s) => s.status === "past_due");

  const mrr = activeSubscriptions.reduce(
    (sum, s) => sum + (s.planAmount || 0),
    0
  );

  return {
    mrr,
    activeSubscriptions: activeSubscriptions.length,
    trials: trials.length,
    pastDue: pastDue.length,
    cancellations: recentCancellations,
    totalCustomers: customers,
    atRiskCustomers: atRiskCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      riskScore: c.riskAssessment?.score || 0,
      mrr: c.subscriptions.reduce((sum, s) => sum + (s.planAmount || 0), 0),
    })),
    hasStripeConnection: !!stripeConnection,
  };
}

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user?.workspaceId) {
    redirect("/onboarding/connect-stripe");
  }

  const data = await getDashboardData(session.user.workspaceId);

  if (!data.hasStripeConnection) {
    redirect("/onboarding/connect-stripe");
  }

  const metrics = [
    {
      title: "Monthly Recurring Revenue",
      value: formatCurrency(data.mrr),
      icon: DollarSign,
      description: "Active subscriptions",
    },
    {
      title: "Active Subscriptions",
      value: data.activeSubscriptions.toString(),
      icon: Users,
      description: `${data.trials} trials`,
    },
    {
      title: "Past Due",
      value: data.pastDue.toString(),
      icon: Clock,
      description: "Require attention",
      alert: data.pastDue > 0,
    },
    {
      title: "Cancellations (30d)",
      value: data.cancellations.toString(),
      icon: XCircle,
      description: "Last 30 days",
      alert: data.cancellations > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your customer churn risk at a glance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon
                  className={`h-4 w-4 ${metric.alert ? "text-destructive" : "text-muted-foreground"}`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* At-Risk Customers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                At-Risk Customers
              </CardTitle>
              <CardDescription>
                Customers with elevated churn risk scores
              </CardDescription>
            </div>
            <Link href="/customers">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.atRiskCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">No at-risk customers!</p>
              <p className="text-sm">Your customer base looks healthy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.atRiskCustomers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getRiskColor(customer.riskScore)}`}
                    >
                      <TrendingDown className="h-5 w-5" />
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(customer.mrr)}/mo
                      </p>
                      <Badge
                        variant={
                          getRiskLevel(customer.riskScore) === "critical"
                            ? "destructive"
                            : getRiskLevel(customer.riskScore) === "high"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        Risk: {customer.riskScore}
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getRiskLevel } from "@/lib/utils";
import {
  DollarSign,
  Users,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingDown,
  Zap,
  ArrowRight,
  TrendingUp,
  Activity,
  Sparkles,
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
      take: 5,
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
      title: "Monthly Revenue",
      value: formatCurrency(data.mrr),
      icon: DollarSign,
      change: "+12.5%",
      changeType: "positive" as const,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Active Subscriptions",
      value: data.activeSubscriptions.toString(),
      icon: Users,
      change: `${data.trials} trials`,
      changeType: "neutral" as const,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "Past Due",
      value: data.pastDue.toString(),
      icon: Clock,
      change: "Needs attention",
      changeType: data.pastDue > 0 ? ("negative" as const) : ("neutral" as const),
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
    },
    {
      title: "Cancellations",
      value: data.cancellations.toString(),
      icon: XCircle,
      change: "Last 30 days",
      changeType: data.cancellations > 0 ? ("negative" as const) : ("neutral" as const),
      gradient: "from-rose-500 to-pink-600",
      bgGradient: "from-rose-50 to-pink-50",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-primary rounded-xl">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <p className="text-slate-500">
            Monitor your customer health and churn risk in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl">
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover overflow-hidden"
            >
              {/* Background gradient accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.bgGradient} rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:opacity-70 transition-opacity`} />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span
                    className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                      metric.changeType === "positive"
                        ? "text-emerald-700 bg-emerald-100"
                        : metric.changeType === "negative"
                          ? "text-rose-700 bg-rose-100"
                          : "text-slate-600 bg-slate-100"
                    }`}
                  >
                    {metric.changeType === "positive" && (
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                    )}
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">
                  {metric.title}
                </h3>
                <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* At-Risk Customers Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg shadow-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">At-Risk Customers</h2>
                <p className="text-sm text-slate-500">Customers showing churn signals</p>
              </div>
            </div>
            <Link href="/customers">
              <Button className="rounded-xl bg-gradient-primary hover:opacity-90 shadow-md shadow-purple-500/20">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6">
          {data.atRiskCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">All Clear!</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Your customer base is healthy. No elevated churn risk detected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.atRiskCustomers.map((customer, index) => {
                const riskLevel = getRiskLevel(customer.riskScore);
                return (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                            riskLevel === "critical"
                              ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30"
                              : riskLevel === "high"
                                ? "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30"
                                : "bg-gradient-to-br from-yellow-500 to-amber-500 shadow-yellow-500/30"
                          }`}
                        >
                          {customer.riskScore}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <TrendingDown className={`h-3 w-3 ${
                            riskLevel === "critical" ? "text-rose-500" :
                            riskLevel === "high" ? "text-orange-500" : "text-yellow-500"
                          }`} />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                          {customer.name || customer.email?.split("@")[0] || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(customer.mrr)}
                          <span className="text-slate-400 font-normal">/mo</span>
                        </p>
                        <Badge
                          variant={
                            riskLevel === "critical"
                              ? "destructive"
                              : riskLevel === "high"
                                ? "warning"
                                : "secondary"
                          }
                          className="mt-1"
                        >
                          {riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-purple-100 transition-colors">
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/25">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-medium">Total Customers</span>
          </div>
          <p className="text-4xl font-bold">{data.totalCustomers}</p>
          <p className="text-purple-200 text-sm mt-1">Across all plans</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <span className="font-medium">At Risk</span>
          </div>
          <p className="text-4xl font-bold">{data.atRiskCustomers.length}</p>
          <p className="text-slate-400 text-sm mt-1">Need your attention</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-medium">Health Score</span>
          </div>
          <p className="text-4xl font-bold">
            {data.totalCustomers > 0
              ? Math.round(((data.totalCustomers - data.atRiskCustomers.length) / data.totalCustomers) * 100)
              : 100}%
          </p>
          <p className="text-emerald-100 text-sm mt-1">Customer retention</p>
        </div>
      </div>
    </div>
  );
}

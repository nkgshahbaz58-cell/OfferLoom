import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getRiskColor, getRiskLevel, getRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  AlertTriangle,
  CreditCard,
  Calendar,
  Mail,
  ExternalLink,
} from "lucide-react";
import type { RiskReason } from "@/types";

async function getCustomerDetail(customerId: string, workspaceId: string) {
  const customer = await db.customer.findFirst({
    where: { id: customerId, workspaceId },
    include: {
      riskAssessment: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) return null;

  const recentEvents = await db.invoiceEvent.findMany({
    where: {
      workspaceId,
      stripeCustomerId: customer.stripeCustomerId,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return { customer, recentEvents };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.workspaceId) {
    redirect("/login");
  }

  const data = await getCustomerDetail(params.id, session.user.workspaceId);
  if (!data) {
    notFound();
  }

  const { customer, recentEvents } = data;
  const riskScore = customer.riskAssessment?.score || 0;
  const riskReasons = (customer.riskAssessment?.reasons || []) as RiskReason[];
  const activeSubscription = customer.subscriptions.find((s) =>
    ["active", "past_due", "trialing"].includes(s.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {customer.name || customer.email || "Unknown Customer"}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {customer.email || "No email"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
            <CardDescription>
              Current churn risk score and contributing factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${getRiskColor(riskScore)}`}
              >
                {riskScore}
              </div>
              <div>
                <Badge
                  variant={
                    getRiskLevel(riskScore) === "critical"
                      ? "destructive"
                      : getRiskLevel(riskScore) === "high"
                        ? "warning"
                        : "secondary"
                  }
                  className="mb-2"
                >
                  {getRiskLevel(riskScore).toUpperCase()} RISK
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Score out of 100
                </p>
              </div>
            </div>

            {riskReasons.length > 0 ? (
              <div className="space-y-3">
                <p className="font-medium text-sm">Risk Factors:</p>
                {riskReasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Badge variant="destructive" className="shrink-0">
                      +{reason.points}
                    </Badge>
                    <p className="text-sm">{reason.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No risk factors detected. Customer appears healthy.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Current subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">
                    {activeSubscription.planName || "Unknown Plan"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {formatCurrency(
                      activeSubscription.planAmount || 0,
                      activeSubscription.currency
                    )}
                    /mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      activeSubscription.status === "active"
                        ? "success"
                        : activeSubscription.status === "past_due"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {activeSubscription.status}
                  </Badge>
                </div>
                {activeSubscription.cancelAtPeriodEnd && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-orange-800 text-sm font-medium">
                      Cancels at period end
                    </p>
                    <p className="text-orange-600 text-xs">
                      {formatDate(activeSubscription.currentPeriodEnd)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Period</span>
                  <span className="text-sm">
                    Ends {formatDate(activeSubscription.currentPeriodEnd)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No active subscription</p>
            )}

            <div className="mt-6 pt-4 border-t">
              <a
                href={`https://dashboard.stripe.com/customers/${customer.stripeCustomerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                View in Stripe
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Events
          </CardTitle>
          <CardDescription>Stripe webhook events for this customer</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No events recorded yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        event.type.includes("failed")
                          ? "destructive"
                          : event.type.includes("deleted") ||
                              event.type.includes("canceled")
                            ? "warning"
                            : "outline"
                      }
                    >
                      {event.type}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {getRelativeTime(event.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

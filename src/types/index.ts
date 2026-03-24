export interface DashboardMetrics {
  mrr: number;
  activeSubscriptions: number;
  trials: number;
  pastDue: number;
  cancellations: number;
  atRiskCustomers: number;
  totalCustomers: number;
}

export interface AtRiskCustomer {
  id: string;
  name: string | null;
  email: string | null;
  stripeCustomerId: string;
  riskScore: number;
  riskReasons: RiskReason[];
  subscriptionStatus: string;
  mrr: number;
}

export interface RiskReason {
  rule: string;
  points: number;
  detail: string;
}

export interface CustomerDetail {
  id: string;
  stripeCustomerId: string;
  email: string | null;
  name: string | null;
  createdAt: string;
  riskScore: number;
  riskReasons: RiskReason[];
  subscriptions: SubscriptionInfo[];
  recentEvents: EventInfo[];
}

export interface SubscriptionInfo {
  id: string;
  stripeSubscriptionId: string;
  status: string;
  planName: string | null;
  planAmount: number | null;
  currency: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export interface EventInfo {
  id: string;
  type: string;
  createdAt: string;
}

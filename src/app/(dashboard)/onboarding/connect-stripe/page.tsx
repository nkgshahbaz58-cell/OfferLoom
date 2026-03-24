"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  TrendingUp,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function ConnectStripePage() {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey, webhookSecret }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect Stripe");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { icon: Users, text: "Sync customers & subscriptions" },
    { icon: TrendingUp, text: "Calculate risk scores" },
    { icon: Zap, text: "Enable real-time monitoring" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="absolute top-40 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
              <Shield className="h-10 w-10" />
            </div>
            <span className="text-3xl font-bold">ChurnSentinel</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Connect your
            <br />
            <span className="text-gradient-warm">Stripe account</span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 leading-relaxed">
            We&apos;ll securely connect to your Stripe account to monitor your
            customer data and identify churn risks before they happen.
          </p>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-purple-300" />
                    <span className="text-lg">{step.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex items-center gap-3 text-slate-400">
            <Lock className="h-5 w-5" />
            <span>Your API keys are encrypted and never stored in plain text</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-purple-50/30">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-gradient-primary rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ChurnSentinel</span>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-purple-500/10 p-8 border border-slate-100">
            {success ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-pulse">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Connected!</h2>
                <p className="text-slate-500 mb-6">
                  Your Stripe account is now linked
                </p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Syncing customers...
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Calculating risk scores...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Key className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Enter API Keys</h2>
                  <p className="text-slate-500 mt-2">
                    Securely connect your Stripe account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="secretKey" className="text-slate-700 font-medium">
                      Secret Key
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="secretKey"
                        type="password"
                        placeholder="sk_live_..."
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        required
                        className="h-12 pl-11 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Find this in{" "}
                      <a
                        href="https://dashboard.stripe.com/apikeys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline font-medium"
                      >
                        Stripe Dashboard → API Keys
                      </a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret" className="text-slate-700 font-medium">
                      Webhook Secret
                      <span className="text-slate-400 font-normal ml-1">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="webhookSecret"
                        type="password"
                        placeholder="whsec_..."
                        value={webhookSecret}
                        onChange={(e) => setWebhookSecret(e.target.value)}
                        className="h-12 pl-11 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Required for real-time event updates
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </div>
                    ) : (
                      <>
                        Connect Stripe
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
                      <Lock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">Bank-level security</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Your credentials are encrypted using AES-256 and never logged or shared.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

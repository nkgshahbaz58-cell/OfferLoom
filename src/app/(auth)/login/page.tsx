"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Github, Mail, Sparkles, TrendingDown, Bell, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn("email", { email, callbackUrl: "/dashboard" });
      setEmailSent(true);
    } catch {
      console.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  const features = [
    { icon: TrendingDown, text: "Predict churn before it happens" },
    { icon: Bell, text: "Real-time Slack & email alerts" },
    { icon: Zap, text: "Stripe integration in minutes" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Shield className="h-10 w-10" />
            </div>
            <span className="text-3xl font-bold tracking-tight">ChurnSentinel</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Stop churn before
            <br />
            <span className="text-purple-200">it costs you</span>
          </h1>

          <p className="text-xl text-purple-100 mb-12 leading-relaxed">
            AI-powered early warning system that identifies at-risk customers
            and helps you retain more revenue.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20"
                >
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-lg">{feature.text}</span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex gap-12 mt-16 pt-8 border-t border-white/20">
            <div>
              <div className="text-4xl font-bold">94%</div>
              <div className="text-purple-200">Prediction accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold">2.5x</div>
              <div className="text-purple-200">Revenue retained</div>
            </div>
            <div>
              <div className="text-4xl font-bold">5min</div>
              <div className="text-purple-200">Setup time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-gradient-primary rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ChurnSentinel</span>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-purple-500/10 p-8 border border-slate-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Start free, upgrade anytime
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-2">
                Sign in to monitor your customer health
              </p>
            </div>

            {emailSent ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Check your inbox</h3>
                <p className="text-slate-500">
                  We sent a magic link to<br />
                  <span className="font-medium text-slate-700">{email}</span>
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending link...
                      </div>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Continue with Email
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-slate-400">or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-base font-medium"
                  onClick={handleGithubLogin}
                >
                  <Github className="mr-2 h-5 w-5" />
                  GitHub
                </Button>

                <p className="text-center text-sm text-slate-400 mt-8">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-purple-600 hover:underline">Terms</a>
                  {" "}and{" "}
                  <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
                </p>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              SOC 2 Compliant
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Real-time sync
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

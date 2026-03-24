import { CheckCircle, XCircle, Database, Key, Shield, ArrowRight, ExternalLink } from "lucide-react";

export default function SetupPage() {
  const envChecks = [
    {
      name: "DATABASE_URL",
      required: true,
      configured: !!process.env.DATABASE_URL,
      description: "PostgreSQL database connection",
      setup: "Add Vercel Postgres or connect external database",
    },
    {
      name: "NEXTAUTH_URL",
      required: true,
      configured: !!process.env.NEXTAUTH_URL,
      description: "Authentication URL (https://offerloom.shop)",
      setup: "Add in environment variables",
    },
    {
      name: "NEXTAUTH_SECRET",
      required: true,
      configured: !!process.env.NEXTAUTH_SECRET,
      description: "Secret for session encryption",
      setup: "Generate with: openssl rand -base64 32",
    },
    {
      name: "STRIPE_SECRET_KEY",
      required: false,
      configured: !!process.env.STRIPE_SECRET_KEY,
      description: "Stripe API key for payments",
      setup: "Get from Stripe Dashboard",
    },
  ];

  const allRequiredConfigured = envChecks
    .filter((check) => check.required)
    .every((check) => check.configured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-500/10 p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome to ChurnSentinel
            </h1>
            <p className="text-slate-500">
              Complete the setup to start monitoring customer churn
            </p>
          </div>

          {/* Status */}
          {allRequiredConfigured ? (
            <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-emerald-900">
                  Setup Complete!
                </h2>
              </div>
              <p className="text-emerald-700 mb-4">
                All required environment variables are configured. Your app is ready to use.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
              >
                Continue to Login
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-orange-900">
                  Setup Required
                </h2>
              </div>
              <p className="text-orange-700">
                Some required environment variables are missing. Configure them to continue.
              </p>
            </div>
          )}

          {/* Environment Variables */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">
              Environment Variables
            </h3>
            {envChecks.map((check) => (
              <div
                key={check.name}
                className={`p-4 rounded-xl border transition-all ${
                  check.configured
                    ? "bg-emerald-50 border-emerald-200"
                    : check.required
                      ? "bg-orange-50 border-orange-200"
                      : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {check.configured ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="font-mono text-sm font-semibold text-slate-900">
                        {check.name}
                      </code>
                      {check.required && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      {check.description}
                    </p>
                    {!check.configured && (
                      <p className="text-xs text-slate-500">
                        {check.setup}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Setup Instructions */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Quick Setup Guide
            </h3>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="font-bold text-purple-600 shrink-0">1.</span>
                <span>
                  Go to{" "}
                  <a
                    href="https://vercel.com/nkgshahbaz58-cells-projects/offerloom/settings/environment-variables"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Vercel Environment Variables
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-purple-600 shrink-0">2.</span>
                <span>
                  Add a <strong>Vercel Postgres</strong> database from the Storage tab
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-purple-600 shrink-0">3.</span>
                <span>
                  Add these environment variables:
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="font-mono text-xs">
                      NEXTAUTH_URL=https://offerloom.shop
                    </li>
                    <li className="font-mono text-xs">
                      NEXTAUTH_SECRET=<span className="text-slate-400">(generate random)</span>
                    </li>
                  </ul>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-purple-600 shrink-0">4.</span>
                <span>Redeploy the app (Vercel will auto-deploy)</span>
              </li>
            </ol>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3">
            <a
              href="https://vercel.com/nkgshahbaz58-cells-projects/offerloom/settings/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
            >
              <Key className="h-4 w-4" />
              Environment Variables
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://vercel.com/nkgshahbaz58-cells-projects/offerloom/stores"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
            >
              <Database className="h-4 w-4" />
              Add Database
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Need help?{" "}
          <a
            href="https://github.com/nkgshahbaz58-cell/OfferLoom"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline"
          >
            View Documentation
          </a>
        </p>
      </div>
    </div>
  );
}

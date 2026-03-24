"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl shadow-red-500/10 p-8 border border-red-100 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Something went wrong
          </h1>

          <p className="text-slate-500 mb-6">
            The application encountered an error. This usually happens when environment
            variables are not configured.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-mono text-slate-600 break-all">
              {error.message || "Unknown error"}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-400 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </button>
            <a
              href="/setup"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              <Home className="h-4 w-4" />
              Go to Setup
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Need help?{" "}
          <a
            href="https://vercel.com/nkgshahbaz58-cells-projects/offerloom/settings/environment-variables"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline"
          >
            Configure Environment Variables
          </a>
        </p>
      </div>
    </div>
  );
}

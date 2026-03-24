"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  Users,
  Bell,
  LogOut,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  user: {
    name?: string | null;
    email: string;
    workspaceName?: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settings/alerts", label: "Alerts", icon: Bell },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r border-slate-100">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100">
          <div className="p-2.5 bg-gradient-primary rounded-xl shadow-lg shadow-purple-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-gradient">ChurnSentinel</span>
            <p className="text-xs text-slate-400">Customer Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-gradient-primary text-white shadow-lg shadow-purple-500/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-400"
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Card */}
        <div className="px-4 pb-4">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="font-semibold text-slate-800">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Get advanced analytics and unlimited alerts
            </p>
            <Button
              size="sm"
              className="w-full bg-gradient-primary hover:opacity-90 shadow-md shadow-purple-500/20"
            >
              Upgrade Now
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-md">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.name || user.email.split("@")[0]}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.workspaceName || user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-xl">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gradient">ChurnSentinel</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex items-center gap-1 px-4 pb-3 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-gradient-primary text-white shadow-md shadow-purple-500/25"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}

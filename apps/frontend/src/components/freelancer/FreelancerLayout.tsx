"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Stethoscope,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FreelancerLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/freelence/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "MCQs",
    icon: FileText,
    subItems: [
      { name: "AI Generation", href: "/generation/mcq/new" },
      { name: "Manual Creation", href: "/generation/mcq/create" },
      { name: "Review Pending", href: "/freelence/pending-review" },
    ],
  },
  {
    name: "QROCs",
    icon: ClipboardList,
    subItems: [
      { name: "AI Generation", href: "/generation/qroc/new" },
      { name: "Manual Creation", href: "/generation/qroc/create" },
    ],
  },
  {
    name: "Clinical Cases",
    icon: Stethoscope,
    subItems: [
      { name: "Create New", href: "/generation/clinical-case/new" },
    ],
  },
  {
    name: "Upload Spreadsheet",
    href: "/generation/upload",
    icon: FileText,
  },
  {
    name: "Earnings",
    href: "/freelence/earnings",
    icon: Wallet,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/freelence/settings",
    icon: Settings,
  },
  {
    name: "Help",
    href: "/freelence/help",
    icon: HelpCircle,
  },
];

export function FreelancerLayout({ children }: FreelancerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    // Clear tokens
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
    }
    router.push("/freelence/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
            <Link
              href="/freelence/dashboard"
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">M</span>
              </div>
              <span className="text-lg font-semibold">MyQCM</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item: any) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.has(item.name);
              const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + "/")) : false;
              const hasActiveSubItem = hasSubItems && item.subItems.some((sub: any) => pathname === sub.href || pathname.startsWith(sub.href + "/"));

              if (hasSubItems) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        hasActiveSubItem
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                        {item.subItems.map((subItem: any) => {
                          const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                isSubActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-sidebar-foreground hover:bg-muted"
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary navigation */}
          <div className="border-t border-sidebar-border p-4 space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-header-border bg-header px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          {/* Header actions */}
          <button className="relative rounded-lg p-2 text-header-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </button>

          <Link
            href="/freelence/settings"
            className="flex items-center gap-2 rounded-lg p-2 text-header-foreground hover:bg-muted"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          </Link>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

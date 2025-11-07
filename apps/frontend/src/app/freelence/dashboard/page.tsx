"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  FileText,
  ClipboardCheck,
  DollarSign,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  Stethoscope,
} from "lucide-react";
import { apiFetch, UnauthorizedError, redirectToLogin, getAccessToken } from "@/app/lib/api";
import { formatRelativeTime } from "@/lib/utils";

type GenerationRequest = {
  id: string;
  status: string;
  createdAt: string;
  course?: { name: string };
  subject?: { name: string };
  requested_mcq_count?: number;
  requested_qroc_count?: number;
};

type DashboardStats = {
  activeRequests: number;
  pendingReview: number;
  approvedToday: number;
  totalEarnings: number;
};

export default function FreelancerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DashboardStats>({
    activeRequests: 0,
    pendingReview: 0,
    approvedToday: 0,
    totalEarnings: 0,
  });
  const [recentActivity, setRecentActivity] = React.useState<GenerationRequest[]>([]);

  React.useEffect(() => {
    const loadDashboard = async () => {
      if (!getAccessToken()) {
        redirectToLogin();
        return;
      }

      try {
        setLoading(true);

        const summaryResponse = await apiFetch<any>("/freelancer/dashboard/summary");
        const payload = summaryResponse?.data ?? summaryResponse ?? {};

        const summaryStats = payload?.stats ?? {};
        const requests = Array.isArray(payload?.recentRequests)
          ? payload.recentRequests
          : [];

        setStats({
          activeRequests: summaryStats.activeRequests ?? 0,
          pendingReview: summaryStats.pendingReview ?? 0,
          approvedToday: summaryStats.approvedToday ?? 0,
          totalEarnings: summaryStats.totalEarnings ?? 0,
        });
        setRecentActivity(requests.slice(0, 5));
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          redirectToLogin();
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "ready_for_review":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "processing":
        return <Clock className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "info" => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "ready_for_review":
        return "warning";
      case "processing":
        return "info";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <FreelancerLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </FreelancerLayout>
    );
  }

  return (
    <FreelancerLayout>
      <div className="space-y-8">
        {/* Page header with gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 backdrop-blur-sm">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Here&apos;s an overview of your creative work
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        </div>

        {/* Stats grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Active Requests"
            value={stats.activeRequests}
            icon={FileText}
            variant="info"
          />
          <Stat
            label="Pending Review"
            value={stats.pendingReview}
            icon={ClipboardCheck}
            variant="warning"
          />
          <Stat
            label="Approved Today"
            value={stats.approvedToday}
            icon={CheckCircle2}
            variant="success"
            trend={{ value: 12, label: "from yesterday" }}
          />
          <Stat
            label="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            variant="default"
          />
        </div>

        {/* Question Type Cards - Beautiful Gradient Cards */}
        <div>
          <h2 className="mb-6 text-2xl font-semibold">Create Questions</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* MCQ Card - Blue Gradient */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 shadow-lg shadow-blue-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-3xl" />
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">MCQs</h3>
                    <p className="text-sm text-muted-foreground">Multiple Choice</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/generation/mcq/new"
                    className="group/btn flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Generation
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                  <Link
                    href="/freelence/pending-review"
                    className="flex items-center justify-between rounded-xl border border-blue-200 bg-white/50 px-5 py-3 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:bg-white/80 hover:border-blue-300 hover:shadow-md"
                  >
                    <span>Review Pending</span>
                    <Badge variant="warning" className="ml-auto">{stats.pendingReview}</Badge>
                  </Link>
                </div>
              </div>
            </div>

            {/* QROC Card - Cyan Gradient */}
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent p-6 shadow-lg shadow-cyan-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent blur-3xl" />
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30">
                    <ClipboardCheck className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">QROCs</h3>
                    <p className="text-sm text-muted-foreground">Short Answer</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/generation/qroc/new"
                    className="group/btn flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Generation
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Clinical Cases Card - Green Gradient */}
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 shadow-lg shadow-emerald-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl" />
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                    <Stethoscope className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Clinical Cases</h3>
                    <p className="text-sm text-muted-foreground">Case Studies</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/generation/clinical-case/new"
                    className="group/btn flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Case
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Spreadsheet - Beautiful Banner */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-8 shadow-lg shadow-amber-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-amber-500/10 to-transparent" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Batch Upload</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Import multiple MCQs or QROCs from a spreadsheet
                </p>
              </div>
            </div>
            <Link
              href="/generation/upload"
              className="group/btn inline-flex items-center gap-3 rounded-xl border-2 border-amber-500/30 bg-white/80 px-6 py-3 font-medium backdrop-blur-sm transition-all duration-300 hover:border-amber-500/50 hover:bg-white hover:shadow-lg hover:scale-105"
            >
              <span>Upload Spreadsheet</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your latest generation requests
              </p>
            </div>
            <Link
              href="/generation/newlegacypage"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No requests yet"
              description="Create your first generation request to get started"
              action={
                <Link
                  href="/generation/mcq/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Create Request
                </Link>
              }
              className="border-0"
            />
          ) : (
            <div className="divide-y">
              {recentActivity.map((request) => (
                <Link
                  key={request.id}
                  href={`/generation/${request.id}`}
                  className="group flex items-center justify-between p-6 transition-all duration-200 hover:bg-muted/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-muted p-2 transition-colors group-hover:bg-primary/10">
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {request.subject?.name || request.course?.name || "Generation Request"}
                        </span>
                        <Badge variant={getStatusVariant(request.status)}>
                          {request.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.requested_mcq_count || 0} MCQs
                        {request.requested_qroc_count
                          ? `, ${request.requested_qroc_count} QROCs`
                          : ""}
                        {" • "}
                        {formatRelativeTime(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </FreelancerLayout>
  );
}

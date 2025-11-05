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

        // Load generation requests
        const requestsResponse = await apiFetch<any>("/generation/requests");
        const requests = Array.isArray(requestsResponse?.data)
          ? requestsResponse.data
          : Array.isArray(requestsResponse)
          ? requestsResponse
          : [];

        // Calculate stats
        const activeRequests = requests.filter(
          (r: any) => r.status !== "completed"
        ).length;

        // Set recent activity
        setRecentActivity(requests.slice(0, 5));
        setStats({
          activeRequests,
          pendingReview: 0, // TODO: Load from API
          approvedToday: 0, // TODO: Load from API
          totalEarnings: 1234, // TODO: Load from wallet API
        });
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
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your work.
          </p>
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

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/generation/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Generation Request
          </Link>
          <Link
            href="/generation/clinical-case/new"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            New Clinical Case
          </Link>
          <Link
            href="/freelence/pending-review"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ClipboardCheck className="h-4 w-4" />
            Review Queue
          </Link>
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">
                Your latest generation requests
              </p>
            </div>
            <Link
              href="/generation/new"
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
                  href="/generation/new"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                  className="flex items-center justify-between p-6 transition-colors hover:bg-muted"
                >
                  <div className="flex items-start gap-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {request.subject?.name || request.course?.name || "Generation Request"}
                        </span>
                        <Badge variant={getStatusVariant(request.status)}>
                          {request.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.requested_mcq_count || 0} MCQs
                        {request.requested_qroc_count
                          ? `, ${request.requested_qroc_count} QROCs`
                          : ""}
                        {" • "}
                        {formatRelativeTime(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </FreelancerLayout>
  );
}

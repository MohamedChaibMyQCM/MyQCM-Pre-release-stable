/*
 * MANUAL MCQ CREATION PAGE
 *
 * ⚠️ CURRENTLY DISABLED - MISSING BACKEND SUPPORT
 *
 * This page allows freelancers to manually create individual MCQs from scratch.
 * However, it requires a backend endpoint that doesn't exist yet:
 *
 * Required: POST /generation/requests/:requestId/items
 *
 * Payload:
 * {
 *   type: "qcm" | "qcs",
 *   question: string,
 *   options: [{ content: string, is_correct: boolean }],
 *   difficulty: "easy" | "medium" | "hard",
 *   quiz_type: "theorique" | "pratique",
 *   mcq_tags: string[],
 *   estimated_time: number,
 *   explanation?: string
 * }
 *
 * The backend currently only supports creating items via:
 * 1. AI generation (uploads source file, AI creates items)
 * 2. Spreadsheet upload (parses CSV/Excel)
 *
 * To enable this page:
 * 1. Add POST endpoint to generation.controller.ts
 * 2. Implement createItem() in generation.service.ts
 * 3. Uncomment navigation links in FreelancerLayout.tsx
 * 4. Uncomment dashboard buttons in dashboard/page.tsx
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourseContextSelector, CourseContext } from "@/components/forms/CourseContextSelector";
import { MCQForm, MCQData } from "@/components/forms/MCQForm";
import { QuestionMetadataForm, QuestionMetadata } from "@/components/forms/QuestionMetadataForm";
import { AlertCircle, Save, X } from "lucide-react";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import toast from "react-hot-toast";

export default function MCQManualCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Course Context
  const [courseContext, setCourseContext] = React.useState<CourseContext>({
    university: "",
    faculty: "",
    year: "",
    unit: "",
    subject: "",
    course: "",
  });

  // MCQ Data
  const [mcqData, setMcqData] = React.useState<MCQData>({
    question: "",
    type: "qcm",
    options: [
      { content: "", is_correct: false },
      { content: "", is_correct: false },
    ],
  });

  // Question Metadata
  const [metadata, setMetadata] = React.useState<QuestionMetadata>({
    difficulty: "medium",
    quiz_type: "theorique",
    mcq_tags: [],
    estimated_time: 60,
    explanation: "",
  });

  const handleCancel = () => {
    router.push("/freelence/dashboard");
  };

  const validate = (): string | null => {
    // Validate course context
    if (
      !courseContext.university ||
      !courseContext.faculty ||
      !courseContext.year ||
      !courseContext.unit ||
      !courseContext.subject ||
      !courseContext.course
    ) {
      return "Please fill in all course context fields";
    }

    // Validate question
    if (!mcqData.question.trim()) {
      return "Please enter a question";
    }

    // Validate options
    if (mcqData.options.length < 2) {
      return "MCQ must have at least 2 options";
    }

    const correctCount = mcqData.options.filter((opt) => opt.is_correct).length;

    if (correctCount === 0) {
      return "Please mark at least one option as correct";
    }

    if (mcqData.type === "qcm" && correctCount > 1) {
      return "Single Correct (QCM) should have exactly one correct answer";
    }

    const emptyOptions = mcqData.options.filter((opt) => !opt.content.trim());
    if (emptyOptions.length > 0) {
      return "All options must have content";
    }

    return null;
  };

  const handleSubmit = async () => {
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Feature is disabled - backend endpoint doesn't exist yet
    setError(
      "⚠️ Manual MCQ creation is currently unavailable. This feature requires a backend endpoint (POST /generation/requests/:id/items) that hasn't been implemented yet. Please use AI Generation or Upload Spreadsheet instead."
    );
    toast.error("Feature not available - missing backend support");
  };

  // Check authentication on mount
  React.useEffect(() => {
    if (!getAccessToken()) {
      redirectToLogin();
    }
  }, []);

  return (
    <FreelancerLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create MCQ Manually
          </h1>
          <p className="text-muted-foreground">
            Create a multiple-choice question from scratch with full control
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Course Context Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Course Context</h2>
            <CourseContextSelector
              value={courseContext}
              onChange={setCourseContext}
            />
          </div>

          {/* MCQ Content Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Question & Options</h2>
            <MCQForm value={mcqData} onChange={setMcqData} />
          </div>

          {/* Metadata Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Question Metadata</h2>
            <QuestionMetadataForm value={metadata} onChange={setMetadata} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between rounded-lg border bg-card p-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create MCQ"}
            </button>
          </div>
        </div>
      </div>
    </FreelancerLayout>
  );
}

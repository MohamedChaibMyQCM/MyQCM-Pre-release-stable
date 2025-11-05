"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourseContextSelector, CourseContext } from "@/components/forms/CourseContextSelector";
import { Upload, AlertCircle, FileSpreadsheet, Download, FileText } from "lucide-react";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import toast from "react-hot-toast";

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function UploadSpreadsheetPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [courseContext, setCourseContext] = React.useState<CourseContext>({
    university: "",
    faculty: "",
    year: "",
    unit: "",
    subject: "",
    course: "",
  });

  const [difficulty, setDifficulty] = React.useState("medium");
  const [file, setFile] = React.useState<File | null>(null);

  const handleCancel = () => {
    router.push("/freelence/dashboard");
  };

  const handleDownloadTemplate = () => {
    // Create MCQ template
    const mcqTemplate = `Question Type,Question,Option 1,Option 2,Option 3,Option 4,Correct Answer(s),Difficulty,Quiz Type,Tags,Estimated Time,Explanation
qcm,"What is 2 + 2?","2","3","4","5","4",medium,theorique,book,60,"Basic addition question"
qcs,"Which are prime numbers?","2","3","4","5","2;3;5",medium,theorique,exam,90,"Multiple correct answers example"
qroc,"What is the capital of France?",,,,,Paris,easy,theorique,book,45,"Short answer question example"

INSTRUCTIONS:
- Question Type: Use 'qcm' for single correct answer, 'qcs' for multiple correct answers, 'qroc' for short answer questions
- For qcm/qcs: Provide at least 2 options
- For qcs (multiple correct): Separate correct answers with semicolon (;)
- For qroc: Leave option columns empty and put answer in "Correct Answer(s)" column
- Difficulty: easy, medium, or hard
- Quiz Type: theorique or pratique
- Tags: Comma-separated (book, serie, exam, td/tp, others)
- Estimated Time: In seconds
- Explanation: Optional rationale for the question`;

    const blob = new Blob([mcqTemplate], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "myqcm_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Template downloaded! Fill it out and upload.");
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate
    if (
      !courseContext.university ||
      !courseContext.faculty ||
      !courseContext.year ||
      !courseContext.unit ||
      !courseContext.subject ||
      !courseContext.course
    ) {
      setError("Please fill in all course context fields");
      return;
    }

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);

    try {
      // Create generation request (we'll determine content types from the file)
      const requestPayload = {
        university_id: courseContext.university,
        faculty_id: courseContext.faculty,
        year_of_study: courseContext.year,
        unit_id: courseContext.unit,
        subject_id: courseContext.subject,
        course_id: courseContext.course,
        difficulty,
        content_types: ["mcq", "qroc"], // Allow both types
        requested_mcq_count: 0,
        requested_qroc_count: 0,
      };

      const createResponse = await apiFetch<any>("/generation/requests", {
        method: "POST",
        body: requestPayload,
      });

      const requestId =
        createResponse?.data?.id ||
        createResponse?.id ||
        createResponse?.data?.request?.id;

      if (!requestId) {
        throw new Error("Failed to create request");
      }

      // Upload spreadsheet
      const formData = new FormData();
      formData.append("file", file);

      await apiFetch(`/generation/requests/${requestId}/upload`, {
        method: "PUT",
        body: formData,
      });

      await apiFetch(`/generation/requests/${requestId}/confirm-upload`, {
        method: "POST",
      });

      toast.success("Spreadsheet uploaded successfully!");
      router.push(`/generation/${requestId}`);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to upload file");
      toast.error("Failed to upload spreadsheet");
    } finally {
      setLoading(false);
    }
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
            Upload Spreadsheet
          </h1>
          <p className="text-muted-foreground">
            Import MCQs and QROCs from an Excel/CSV file with full control
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Template Download Section */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-lg font-semibold">
                  Step 1: Download Template
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Download our CSV template with examples and instructions. Fill it
                  out with your questions, then upload below.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
              </div>
            </div>
          </div>

          {/* Course Context Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Step 2: Select Course Context
            </h2>
            <CourseContextSelector
              value={courseContext}
              onChange={setCourseContext}
            />
          </div>

          {/* Difficulty Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Step 3: Set Default Difficulty
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Default Difficulty (can be overridden in spreadsheet) *
              </label>
              <div className="flex gap-4">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="difficulty"
                      value={option.value}
                      checked={difficulty === option.value}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Step 4: Upload Your Spreadsheet
            </h2>
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium">
                Drag and drop your file here, or click to browse
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                Supports: CSV, XLSX, XLS (Max 10MB)
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Choose File
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-muted-foreground">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="rounded-lg border border-info/50 bg-info/5 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 text-info" />
              What happens after upload?
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Your spreadsheet will be parsed and validated</li>
              <li>• Questions will be imported into a generation request</li>
              <li>• You can review, edit, or delete any imported questions</li>
              <li>• Both MCQs and QROCs can be in the same file</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between rounded-lg border bg-card p-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {loading ? "Uploading..." : "Upload & Import"}
            </button>
          </div>
        </div>
      </div>
    </FreelancerLayout>
  );
}

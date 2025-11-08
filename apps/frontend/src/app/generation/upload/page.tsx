"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CourseContextSelector,
  CourseContext,
} from "@/components/forms/CourseContextSelector";
import {
  Upload,
  AlertCircle,
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import toast from "react-hot-toast";

type BatchUploadPreview = {
  id: string;
  question: string;
  type: string;
  estimated_time: number;
  approval_status: string;
  difficulty: string;
  quiz_type: string;
  options?: { content: string; is_correct: boolean }[];
  answer?: string;
  explanation?: string;
  knowledge_components?: string[];
};

type BatchUploadResult = {
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
  preview: BatchUploadPreview[];
};

const MAX_PREVIEW_ITEMS = 5;

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
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<BatchUploadResult | null>(null);

  const handleCancel = () => {
    router.push("/freelence/dashboard");
  };

  const handleDownloadTemplate = () => {
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
- Explanation: Optional rationale for the question

FILLED COLUMNS:
- University / Faculty / Unit / Course metadata come from the selection above
- Knowledge components can be left blank; they default to "KC General" until AI processing
`;

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
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("university", courseContext.university);
      formData.append("faculty", courseContext.faculty);
      formData.append("unit", courseContext.unit);
      formData.append("subject", courseContext.subject);
      formData.append("course", courseContext.course);
      formData.append("year_of_study", courseContext.year);

      const response = await apiFetch<any>("/mcq/batch-upload", {
        method: "POST",
        body: formData,
      });

      const payload: BatchUploadResult =
        response?.data ?? response ?? {
          created: 0,
          failed: 0,
          errors: [],
          preview: [],
        };

      setResult(payload);
      toast.success(`Imported ${payload.created} question(s)!`);
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

  React.useEffect(() => {
    if (!getAccessToken()) {
      redirectToLogin();
    }
  }, []);

  return (
    <FreelancerLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload Spreadsheet</h1>
          <p className="text-muted-foreground">
            Import MCQs and QROCs from an Excel/CSV file. We store them immediately and run AI
            enrichment later.
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
                <h2 className="mb-2 text-lg font-semibold">Step 1: Download Template</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Download our CSV template with examples and instructions. Fill it out with your
                  questions, then upload below.
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
            <h2 className="mb-4 text-lg font-semibold">Step 2: Select Course Context</h2>
            <CourseContextSelector value={courseContext} onChange={setCourseContext} />
          </div>

          {/* Guidance Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-2 text-lg font-semibold">Step 3: Prepare Your Spreadsheet</h2>
            <p className="text-sm text-muted-foreground">
              Keep MCQs and QROCs in the same file. Leave the knowledge component column empty if
              you want the default “KC General” placeholder—we’ll enrich them with AI later.
            </p>
          </div>

          {/* Upload Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Step 4: Upload Your Spreadsheet</h2>
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium">
                Drag and drop your file here, or click to browse
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                Supports: CSV, XLSX, XLS (Max 5MB)
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

          {/* Import Result */}
          {result && (
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Imported {result.created} question(s) with {result.failed} issue(s)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Newly created MCQs are tagged with the fallback knowledge component “KC
                      General”. Use the AI enrichment flow later to retag them.
                    </p>
                  </div>

                  {result.preview?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">
                        Preview ({Math.min(result.preview.length, MAX_PREVIEW_ITEMS)} of{" "}
                        {result.preview.length})
                      </p>
                      <div className="mt-2 space-y-3">
                        {result.preview.slice(0, MAX_PREVIEW_ITEMS).map((item) => (
                          <div
                            key={item.id}
                            className="rounded-md border border-border p-3 text-left"
                          >
                            <p className="font-medium">{item.question}</p>
                            <p className="text-xs text-muted-foreground">
                              Type: {item.type.toUpperCase()} • Difficulty: {item.difficulty} • Quiz:{" "}
                              {item.quiz_type}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.errors?.length > 0 && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      <p className="font-semibold">
                        {result.failed} row(s) could not be imported
                      </p>
                      <ul className="mt-2 space-y-1 text-xs">
                        {result.errors.slice(0, 3).map((err, index) => (
                          <li key={`${err.row}-${index}`}>
                            Row {err.row}: {err.message}
                          </li>
                        ))}
                        {result.errors.length > 3 && (
                          <li>…and {result.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-lg border border-info/50 bg-info/5 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 text-info" />
              What happens after upload?
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• The spreadsheet is parsed server-side (no AI involved)</li>
              <li>• MCQs/QROCs are inserted directly into the database</li>
              <li>• Each MCQ is tagged with “KC General” until AI enrichment</li>
              <li>• You can trigger AI processing later from a separate page</li>
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

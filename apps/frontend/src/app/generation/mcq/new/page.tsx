"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { Wizard, WizardStep, WizardActions } from "@/components/ui/wizard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CourseContextSelector, CourseContext } from "@/components/forms/CourseContextSelector";
import { Upload, AlertCircle, FileText } from "lucide-react";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import toast from "react-hot-toast";

const WIZARD_STEPS = [
  { title: "Course Context", description: "Select course details" },
  { title: "Configuration", description: "Set MCQ parameters" },
  { title: "Upload & Submit", description: "Add source file" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function MCQAIWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Step 1: Course Context
  const [courseContext, setCourseContext] = React.useState<CourseContext>({
    university: "",
    faculty: "",
    year: "",
    unit: "",
    subject: "",
    course: "",
  });

  // Step 2: Configuration
  const [difficulty, setDifficulty] = React.useState("medium");
  const [mcqCount, setMcqCount] = React.useState(10);

  // Step 3: Upload
  const [file, setFile] = React.useState<File | null>(null);

  const handleNext = () => {
    setError(null);

    // Validate current step
    if (currentStep === 1) {
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
    }

    if (currentStep === 2) {
      if (mcqCount <= 0) {
        setError("MCQ count must be greater than 0");
        return;
      }
    }

    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.push("/freelence/dashboard");
  };

  const handleSubmit = async () => {
    setError(null);

    if (!file) {
      setError("Please upload a source file");
      return;
    }

    setLoading(true);

    try {
      // Create generation request
      const requestPayload = {
        university_id: courseContext.university,
        faculty_id: courseContext.faculty,
        year_of_study: courseContext.year,
        unit_id: courseContext.unit,
        subject_id: courseContext.subject,
        course_id: courseContext.course,
        difficulty,
        content_types: ["mcq"],
        requested_mcq_count: mcqCount,
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

      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      await apiFetch(`/generation/requests/${requestId}/upload`, {
        method: "PUT",
        body: formData,
      });

      await apiFetch(`/generation/requests/${requestId}/confirm-upload`, {
        method: "POST",
      });

      toast.success("MCQ generation request created successfully!");
      router.push(`/generation/${requestId}`);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setError(
        err instanceof Error ? err.message : "Failed to create request"
      );
      toast.error("Failed to create request");
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
            AI-Powered MCQ Generation
          </h1>
          <p className="text-muted-foreground">
            Upload a source document and let AI generate multiple-choice questions automatically
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <Wizard steps={WIZARD_STEPS} currentStep={currentStep} />

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Course Context */}
          {currentStep === 1 && (
            <WizardStep>
              <CourseContextSelector
                value={courseContext}
                onChange={setCourseContext}
              />
            </WizardStep>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 2 && (
            <WizardStep>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of MCQs to Generate *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={mcqCount}
                    onChange={(e) => setMcqCount(parseInt(e.target.value) || 10)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 5-20 questions per request for best quality
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty *</label>
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

                <div className="rounded-lg border bg-muted p-4">
                  <h3 className="mb-2 font-semibold">What happens next?</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• AI will analyze your source document</li>
                    <li>• Generate {mcqCount} multiple-choice questions</li>
                    <li>• Questions will be ready for your review</li>
                    <li>• You can approve, edit, or reject each question</li>
                  </ul>
                </div>
              </div>
            </WizardStep>
          )}

          {/* Step 3: Upload & Submit */}
          {currentStep === 3 && (
            <WizardStep>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Source Document *
                  </label>
                  <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                    <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 text-sm font-medium">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Supports: PDF, DOCX, TXT (Max 50MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
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
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-4">
                  <h3 className="mb-2 font-semibold">Request Summary</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type:</dt>
                      <dd className="font-medium">AI-Generated MCQs</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Quantity:</dt>
                      <dd className="font-medium">{mcqCount} questions</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Difficulty:</dt>
                      <dd className="font-medium capitalize">{difficulty}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Source:</dt>
                      <dd className="font-medium">
                        {file ? file.name : "No file selected"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </WizardStep>
          )}

          <WizardActions
            onBack={handleBack}
            onNext={currentStep === WIZARD_STEPS.length ? handleSubmit : handleNext}
            onCancel={handleCancel}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === WIZARD_STEPS.length}
            nextDisabled={loading}
            loading={loading}
          />
        </div>
      </div>
    </FreelancerLayout>
  );
}

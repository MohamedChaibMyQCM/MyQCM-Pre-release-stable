"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FreelancerLayout } from "@/components/freelancer/FreelancerLayout";
import { Wizard, WizardStep, WizardActions } from "@/components/ui/wizard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Bot, Upload, AlertCircle } from "lucide-react";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
  getAccessToken,
} from "@/app/lib/api";
import toast from "react-hot-toast";

type SelectOption = {
  id: string;
  name: string;
};

const WIZARD_STEPS = [
  { title: "Course Context", description: "Select course details" },
  { title: "Workflow", description: "Choose generation method" },
  { title: "Configure", description: "Set parameters" },
  { title: "Upload & Submit", description: "Add files and create" },
];

const YEAR_OPTIONS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
  "Sixth Year",
  "Seventh Year",
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function GenerationWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Step 1: Course Context
  const [universities, setUniversities] = React.useState<SelectOption[]>([]);
  const [faculties, setFaculties] = React.useState<SelectOption[]>([]);
  const [units, setUnits] = React.useState<SelectOption[]>([]);
  const [subjects, setSubjects] = React.useState<SelectOption[]>([]);
  const [courses, setCourses] = React.useState<SelectOption[]>([]);

  const [selectedUniversity, setSelectedUniversity] = React.useState("");
  const [selectedFaculty, setSelectedFaculty] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");
  const [selectedUnit, setSelectedUnit] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState("");

  // Step 2: Workflow
  const [workflow, setWorkflow] = React.useState<"ai" | "spreadsheet">("ai");

  // Step 3: Configuration
  const [difficulty, setDifficulty] = React.useState("medium");
  const [contentTypes, setContentTypes] = React.useState<string[]>(["mcq"]);
  const [mcqCount, setMcqCount] = React.useState(10);
  const [qrocCount, setQrocCount] = React.useState(0);

  // Step 4: Upload
  const [file, setFile] = React.useState<File | null>(null);

  // Load universities on mount
  React.useEffect(() => {
    const loadUniversities = async () => {
      if (!getAccessToken()) {
        redirectToLogin();
        return;
      }

      try {
        const response = await apiFetch<any>("/universities?limit=1000");
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setUniversities(
          data.map((u: any) => ({ id: u.id || u.uuid, name: u.name }))
        );
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
        }
      }
    };

    loadUniversities();
  }, []);

  // Load faculties when university changes
  React.useEffect(() => {
    if (!selectedUniversity) return;

    const loadFaculties = async () => {
      try {
        const response = await apiFetch<any>(
          `/universities/${selectedUniversity}/faculties?limit=1000`
        );
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setFaculties(
          data.map((f: any) => ({ id: f.id || f.uuid, name: f.name }))
        );
      } catch (err) {
        console.error("Failed to load faculties:", err);
      }
    };

    loadFaculties();
  }, [selectedUniversity]);

  // Load units when faculty and year are selected
  React.useEffect(() => {
    if (!selectedFaculty || !selectedYear) return;

    const loadUnits = async () => {
      try {
        const response = await apiFetch<any>(
          `/faculties/${selectedFaculty}/units?year_of_study=${selectedYear}&limit=1000`
        );
        const data = Array.isArray(response?.units)
          ? response.units
          : Array.isArray(response?.data?.units)
          ? response.data.units
          : [];
        setUnits(data.map((u: any) => ({ id: u.id || u.uuid, name: u.name })));
      } catch (err) {
        console.error("Failed to load units:", err);
      }
    };

    loadUnits();
  }, [selectedFaculty, selectedYear]);

  // Load subjects when unit is selected
  React.useEffect(() => {
    if (!selectedUnit) return;

    const loadSubjects = async () => {
      try {
        const response = await apiFetch<any>(
          `/units/${selectedUnit}/subjects?limit=1000`
        );
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setSubjects(
          data.map((s: any) => ({ id: s.id || s.uuid, name: s.name }))
        );
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    };

    loadSubjects();
  }, [selectedUnit]);

  // Load courses when subject is selected
  React.useEffect(() => {
    if (!selectedSubject) return;

    const loadCourses = async () => {
      try {
        const response = await apiFetch<any>(
          `/subjects/${selectedSubject}/courses?limit=1000`
        );
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setCourses(
          data.map((c: any) => ({ id: c.id || c.uuid, name: c.name }))
        );
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    loadCourses();
  }, [selectedSubject]);

  const handleNext = () => {
    setError(null);

    // Validate current step
    if (currentStep === 1) {
      if (!selectedUniversity || !selectedFaculty || !selectedYear || !selectedUnit || !selectedSubject || !selectedCourse) {
        setError("Please fill in all course context fields");
        return;
      }
    }

    if (currentStep === 3) {
      if (contentTypes.length === 0) {
        setError("Please select at least one content type");
        return;
      }
      if (contentTypes.includes("mcq") && mcqCount <= 0) {
        setError("MCQ count must be greater than 0");
        return;
      }
      if (contentTypes.includes("qroc") && qrocCount <= 0) {
        setError("QROC count must be greater than 0");
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

    if (workflow === "ai" && !file) {
      setError("Please upload a source file");
      return;
    }

    setLoading(true);

    try {
      // Create generation request
      const requestPayload = {
        university_id: selectedUniversity,
        faculty_id: selectedFaculty,
        year_of_study: selectedYear,
        unit_id: selectedUnit,
        subject_id: selectedSubject,
        course_id: selectedCourse,
        difficulty,
        content_types: contentTypes,
        requested_mcq_count: contentTypes.includes("mcq") ? mcqCount : 0,
        requested_qroc_count: contentTypes.includes("qroc") ? qrocCount : 0,
      };

      const createResponse = await apiFetch<any>("/generation/requests", {
        method: "POST",
        body: requestPayload,
      });

      const requestId =
        createResponse?.data?.id || createResponse?.id || createResponse?.data?.request?.id;

      if (!requestId) {
        throw new Error("Failed to create request");
      }

      // If AI workflow and file exists, upload it
      if (workflow === "ai" && file) {
        const formData = new FormData();
        formData.append("file", file);

        await apiFetch(`/generation/requests/${requestId}/upload`, {
          method: "PUT",
          body: formData,
        });

        await apiFetch(`/generation/requests/${requestId}/confirm-upload`, {
          method: "POST",
        });
      }

      toast.success("Generation request created successfully!");
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

  const toggleContentType = (type: string) => {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <FreelancerLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            New Generation Request
          </h1>
          <p className="text-muted-foreground">
            Create a new request to generate MCQs or QROCs
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
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">University *</label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => {
                      setSelectedUniversity(e.target.value);
                      setSelectedFaculty("");
                      setSelectedUnit("");
                      setSelectedSubject("");
                      setSelectedCourse("");
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select university...</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Faculty *</label>
                  <select
                    value={selectedFaculty}
                    onChange={(e) => {
                      setSelectedFaculty(e.target.value);
                      setSelectedUnit("");
                      setSelectedSubject("");
                      setSelectedCourse("");
                    }}
                    disabled={!selectedUniversity}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select faculty...</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Year of Study *</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedUnit("");
                      setSelectedSubject("");
                      setSelectedCourse("");
                    }}
                    disabled={!selectedFaculty}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select year...</option>
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit *</label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => {
                      setSelectedUnit(e.target.value);
                      setSelectedSubject("");
                      setSelectedCourse("");
                    }}
                    disabled={!selectedYear}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select unit...</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedCourse("");
                    }}
                    disabled={!selectedUnit}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Course *</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    disabled={!selectedSubject}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </WizardStep>
          )}

          {/* Step 2: Workflow Selection */}
          {currentStep === 2 && (
            <WizardStep>
              <div className="grid gap-6 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setWorkflow("ai")}
                  className={`relative flex flex-col items-center gap-4 rounded-lg border-2 p-6 text-center transition-all ${
                    workflow === "ai"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      workflow === "ai"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <Bot className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">AI Generator</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a source document and let AI generate questions
                      automatically
                    </p>
                  </div>
                  {workflow === "ai" && (
                    <Badge className="absolute right-4 top-4">Selected</Badge>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setWorkflow("spreadsheet")}
                  className={`relative flex flex-col items-center gap-4 rounded-lg border-2 p-6 text-center transition-all ${
                    workflow === "spreadsheet"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      workflow === "spreadsheet"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Spreadsheet Upload
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Import a pre-made batch from Excel with full control
                    </p>
                  </div>
                  {workflow === "spreadsheet" && (
                    <Badge className="absolute right-4 top-4">Selected</Badge>
                  )}
                </button>
              </div>
            </WizardStep>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && (
            <WizardStep>
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-medium">
                    Content Types *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={contentTypes.includes("mcq")}
                        onChange={() => toggleContentType("mcq")}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                      />
                      <span>Multiple Choice Questions (MCQ)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={contentTypes.includes("qroc")}
                        onChange={() => toggleContentType("qroc")}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                      />
                      <span>Short Answer Questions (QROC)</span>
                    </label>
                  </div>
                </div>

                {contentTypes.includes("mcq") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">MCQ Count *</label>
                    <input
                      type="number"
                      min="1"
                      value={mcqCount}
                      onChange={(e) => setMcqCount(parseInt(e.target.value) || 0)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                )}

                {contentTypes.includes("qroc") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">QROC Count *</label>
                    <input
                      type="number"
                      min="1"
                      value={qrocCount}
                      onChange={(e) => setQrocCount(parseInt(e.target.value) || 0)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                )}

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
              </div>
            </WizardStep>
          )}

          {/* Step 4: Upload & Submit */}
          {currentStep === 4 && (
            <WizardStep>
              {workflow === "ai" && (
                <div className="space-y-4">
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
                        <p className="mt-4 text-sm text-muted-foreground">
                          Selected: {file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border bg-muted p-4">
                <h3 className="mb-2 font-semibold">Request Summary</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Course:</dt>
                    <dd className="font-medium">
                      {courses.find((c) => c.id === selectedCourse)?.name ||
                        "N/A"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Year:</dt>
                    <dd className="font-medium">{selectedYear || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd className="font-medium">
                      {contentTypes.includes("mcq") && `${mcqCount} MCQs`}
                      {contentTypes.includes("mcq") &&
                        contentTypes.includes("qroc") &&
                        ", "}
                      {contentTypes.includes("qroc") && `${qrocCount} QROCs`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Difficulty:</dt>
                    <dd className="font-medium capitalize">{difficulty}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Workflow:</dt>
                    <dd className="font-medium capitalize">{workflow}</dd>
                  </div>
                </dl>
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
